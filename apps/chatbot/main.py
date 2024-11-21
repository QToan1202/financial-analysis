import os
import uuid
import json
from psycopg import Connection
from psycopg import AsyncConnection, Connection
from fastapi import FastAPI, Request
from contextlib import asynccontextmanager

from copilotkit import CopilotKitSDK, LangGraphAgent
from copilotkit.langgraph_agent import _StreamingStateExtractor
from copilotkit.sdk import CopilotKitSDKContext
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit.types import Message
from copilotkit.action import ActionDict
from copilotkit.exc import (
    AgentNotFoundException,
    AgentExecutionException
)

from typing import Optional, List, Callable, cast, Any

from langchain_core.runnables import RunnableConfig, ensure_config
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langchain.load.dump import dumps as langchain_dumps

# from rag.memory import builder as state_graph
from rag.memory import *
from agent import workflow as state_graph
# from api import handler
from copilotkit.integrations.fastapi import handler

DB_URI = os.environ.get("PSQL_CONNECTION")
connection_kwargs = {
    "autocommit": True,
    "prepare_threshold": 0,
}
# app = FastAPI(title="LangGraph Server",
#               version="1.0",
#               description="A simple api server using CopilotSDK",
#               )

# if sys.platform:
#     asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

sdk: None | CopilotKitSDK = None


# async def setup():
#     global sdk
#     conn = await AsyncConnection.connect(DB_URI, **connection_kwargs)
#     checkpointer = AsyncPostgresSaver(conn)
#     config = {"configurable": {
#         "user_id": "1", "thread_id": "chat_thread_1"}}
#     graph = state_graph.compile(checkpointer=checkpointer)

#     sdk = CopilotKitSDK(agents=[
#         LangGraphAgent(
#             name="chat-with-memory-agent",
#             description="Agent that answers interact with human",
#             graph=graph,
#             langgraph_config=config,
#         )
#     ])


# asyncio.run(setup())

class LangGraphAgentSync(LangGraphAgent):
    def _stream_events(  # pylint: disable=too-many-locals
        self,
        *,
        mode: str,
        config: RunnableConfig,
        state: Any,
        node_name: Optional[str] = None
    ):

        streaming_state_extractor = _StreamingStateExtractor([])
        initial_state = state if mode == "start" else None
        prev_node_name = None
        emit_intermediate_state_until_end = None
        should_exit = False
        thread_id = cast(Any, config)["configurable"]["thread_id"]

        for event in self.graph.stream(initial_state, config):
            current_node_name = event.get("name")
            event_type = event.get("event")
            run_id = event.get("run_id")
            metadata = event.get("metadata", {})

            should_exit = should_exit or metadata.get("copilotkit:exit", False)

            emit_intermediate_state = metadata.get(
                "copilotkit:emit-intermediate-state")
            force_emit_intermediate_state = metadata.get(
                "copilotkit:force-emit-intermediate-state", False)  # pylint: disable=line-too-long
            manually_emit_message = metadata.get(
                "copilotkit:manually-emit-message", False)
            manually_emit_tool_call = metadata.get(
                "copilotkit:manually-emit-tool-call", False)

            # we only want to update the node name under certain conditions
            # since we don't need any internal node names to be sent to the frontend
            if current_node_name in self.graph.nodes.keys():
                node_name = current_node_name

            # we don't have a node name yet, so we can't update the state
            if node_name is None:
                continue

            exiting_node = node_name == current_node_name and event_type == "on_chain_end"

            if force_emit_intermediate_state:
                if event_type == "on_chain_end":
                    state = cast(Any, event["data"])["output"]
                    yield self._emit_state_sync_event(
                        thread_id=thread_id,
                        run_id=run_id,
                        node_name=node_name,
                        state=state,
                        running=True,
                        active=True
                    ) + "\n"
                continue

            if manually_emit_message:
                if event_type == "on_chain_end":
                    yield json.dumps(
                        {
                            "event": "on_copilotkit_emit_message",
                            "message": cast(Any, event["data"])["output"],
                            "message_id": str(uuid.uuid4()),
                            "role": "assistant"
                        }
                    ) + "\n"
                continue

            if manually_emit_tool_call:
                if event_type == "on_chain_end":
                    yield json.dumps(
                        {
                            "event": "on_copilotkit_emit_tool_call",
                            "name": cast(Any, event["data"])["output"]["name"],
                            "args": cast(Any, event["data"])["output"]["args"],
                            "id": cast(Any, event["data"])["output"]["id"]
                        }
                    ) + "\n"
                continue

            if emit_intermediate_state and emit_intermediate_state_until_end is None:
                emit_intermediate_state_until_end = node_name

            if emit_intermediate_state and event_type == "on_chat_model_start":
                # reset the streaming state extractor
                streaming_state_extractor = _StreamingStateExtractor(
                    emit_intermediate_state)

            updated_state = self.graph.get_state(config).values

            if emit_intermediate_state and event_type == "on_chat_model_stream":
                streaming_state_extractor.buffer_tool_calls(event)

            if emit_intermediate_state_until_end is not None:
                updated_state = {
                    **updated_state,
                    **streaming_state_extractor.extract_state()
                }

            if (not emit_intermediate_state and
                current_node_name == emit_intermediate_state_until_end and
                    event_type == "on_chain_end"):
                # stop emitting function call state
                emit_intermediate_state_until_end = None

            # we send state sync events when:
            #   a) the state has changed
            #   b) the node has changed
            #   c) the node is ending
            if updated_state != state or prev_node_name != node_name or exiting_node:
                state = updated_state
                prev_node_name = node_name
                yield self._emit_state_sync_event(
                    thread_id=thread_id,
                    run_id=run_id,
                    node_name=node_name,
                    state=state,
                    running=True,
                    active=not exiting_node
                ) + "\n"

            yield langchain_dumps(event) + "\n"

        state = self.graph.get_state(config)
        is_end_node = state.next == ()

        node_name = list(state.metadata["writes"].keys())[0]

        yield self._emit_state_sync_event(
            thread_id=thread_id,
            run_id=run_id,
            node_name=cast(str, node_name) if not is_end_node else "__end__",
            state=state.values,
            running=not should_exit,
            # at this point, the node is ending so we set active to false
            active=False
        ) + "\n"


class LangGraphAgentAsync(LangGraphAgent):
    async def execute(  # pylint: disable=too-many-arguments
        self,
        *,
        state: dict,
        messages: List[Message],
        thread_id: Optional[str] = None,
        node_name: Optional[str] = None,
        actions: Optional[List[ActionDict]] = None,
    ):
        config = ensure_config(cast(Any, self.langgraph_config.copy(
        )) if self.langgraph_config else {})  # pylint: disable=line-too-long
        config["configurable"] = config.get("configurable", {})
        config["configurable"]["thread_id"] = thread_id

        agent_state = await self.graph.aget_state(config)
        state["messages"] = agent_state.values.get("messages", [])

        langchain_messages = self.convert_messages(messages)
        state = cast(Callable, self.merge_state)(
            state=state,
            messages=langchain_messages,
            actions=actions,
            agent_name=self.name
        )

        mode = "continue" if thread_id and node_name != "__end__" else "start"
        thread_id = thread_id or str(uuid.uuid4())
        config["configurable"]["thread_id"] = thread_id

        if mode == "continue":
            await self.graph.aupdate_state(config, state, as_node=node_name)

        return self._stream_events(
            mode=mode,
            config=config,
            state=state,
            node_name=node_name
        )

    async def _stream_events(  # pylint: disable=too-many-locals
        self,
        *,
        mode: str,
        config: RunnableConfig,
        state: Any,
        node_name: Optional[str] = None
    ):

        streaming_state_extractor = _StreamingStateExtractor([])
        initial_state = state if mode == "start" else None
        prev_node_name = None
        emit_intermediate_state_until_end = None
        should_exit = False
        thread_id = cast(Any, config)["configurable"]["thread_id"]

        async for event in self.graph.astream_events(initial_state, config, version="v1"):
            print("DEBUG: ", event)
            current_node_name = event.get("name")
            event_type = event.get("event")
            run_id = event.get("run_id")
            metadata = event.get("metadata", {})

            should_exit = should_exit or metadata.get("copilotkit:exit", False)

            emit_intermediate_state = metadata.get(
                "copilotkit:emit-intermediate-state")
            force_emit_intermediate_state = metadata.get(
                "copilotkit:force-emit-intermediate-state", False)  # pylint: disable=line-too-long
            manually_emit_message = metadata.get(
                "copilotkit:manually-emit-message", False)
            manually_emit_tool_call = metadata.get(
                "copilotkit:manually-emit-tool-call", False)

            # we only want to update the node name under certain conditions
            # since we don't need any internal node names to be sent to the frontend
            if current_node_name in self.graph.nodes.keys():
                node_name = current_node_name

            # we don't have a node name yet, so we can't update the state
            if node_name is None:
                continue

            exiting_node = node_name == current_node_name and event_type == "on_chain_end"

            if force_emit_intermediate_state:
                if event_type == "on_chain_end":
                    state = cast(Any, event["data"])["output"]
                    yield self._emit_state_sync_event(
                        thread_id=thread_id,
                        run_id=run_id,
                        node_name=node_name,
                        state=state,
                        running=True,
                        active=True
                    ) + "\n"
                continue

            if manually_emit_message:
                if event_type == "on_chain_end":
                    yield json.dumps(
                        {
                            "event": "on_copilotkit_emit_message",
                            "message": cast(Any, event["data"])["output"],
                            "message_id": str(uuid.uuid4()),
                            "role": "assistant"
                        }
                    ) + "\n"
                continue

            if manually_emit_tool_call:
                if event_type == "on_chain_end":
                    yield json.dumps(
                        {
                            "event": "on_copilotkit_emit_tool_call",
                            "name": cast(Any, event["data"])["output"]["name"],
                            "args": cast(Any, event["data"])["output"]["args"],
                            "id": cast(Any, event["data"])["output"]["id"]
                        }
                    ) + "\n"
                continue

            if emit_intermediate_state and emit_intermediate_state_until_end is None:
                emit_intermediate_state_until_end = node_name

            if emit_intermediate_state and event_type == "on_chat_model_start":
                # reset the streaming state extractor
                streaming_state_extractor = _StreamingStateExtractor(
                    emit_intermediate_state)

            updated_state = await self.graph.aget_state(config)

            if emit_intermediate_state and event_type == "on_chat_model_stream":
                streaming_state_extractor.buffer_tool_calls(event)

            if emit_intermediate_state_until_end is not None:
                updated_state = {
                    **updated_state,
                    **streaming_state_extractor.extract_state()
                }

            if (not emit_intermediate_state and
                current_node_name == emit_intermediate_state_until_end and
                    event_type == "on_chain_end"):
                # stop emitting function call state
                emit_intermediate_state_until_end = None

            # we send state sync events when:
            #   a) the state has changed
            #   b) the node has changed
            #   c) the node is ending
            if updated_state != state or prev_node_name != node_name or exiting_node:
                state = updated_state
                prev_node_name = node_name
                yield self._emit_state_sync_event(
                    thread_id=thread_id,
                    run_id=run_id,
                    node_name=node_name,
                    state=state,
                    running=True,
                    active=not exiting_node
                ) + "\n"

            yield langchain_dumps(event) + "\n"

        state = await self.agraph.get_state(config)
        is_end_node = state.next == ()

        node_name = list(state.metadata["writes"].keys())[0]

        yield self._emit_state_sync_event(
            thread_id=thread_id,
            run_id=run_id,
            node_name=cast(str, node_name) if not is_end_node else "__end__",
            state=state.values,
            running=not should_exit,
            # at this point, the node is ending so we set active to false
            active=False
        ) + "\n"


class CopilotKitSDKAsync(CopilotKitSDK):
    async def execute_agent(  # pylint: disable=too-many-arguments
        self,
        *,
        context: CopilotKitSDKContext,
        name: str,
        thread_id: str,
        node_name: str,
        state: dict,
        messages: List[Message],
        actions: List[ActionDict],
    ) -> Any:
        """Execute an agent"""
        agents = self.agents(context) if callable(self.agents) else self.agents
        agent = next((agent for agent in agents if agent.name == name), None)
        if agent is None:
            raise AgentNotFoundException(name)

        # logger.info(bold("Handling execute agent request:"))
        # logger.info("--------------------------")
        # logger.info(bold("Context:"))
        # logger.info(pformat(context))
        # logger.info(bold("Agent:"))
        # logger.info(pformat(agent.dict_repr()))
        # logger.info(bold("Thread ID:"))
        # logger.info(thread_id)
        # logger.info(bold("Node Name:"))
        # logger.info(node_name)
        # logger.info(bold("State:"))
        # logger.info(pformat(state))
        # logger.info(bold("Messages:"))
        # logger.info(pformat(messages))
        # logger.info(bold("Actions:"))
        # logger.info(pformat(actions))
        # logger.info("--------------------------")

        try:
            return await agent.execute(
                thread_id=thread_id,
                node_name=node_name,
                state=state,
                messages=messages,
                actions=actions,
            )
        except Exception as error:
            raise AgentExecutionException(name, error) from error


config = {"configurable": {
    "user_id": "1", "thread_id": "1"}}


@asynccontextmanager
async def lifespan(app: FastAPI):
    with Connection.connect(DB_URI, **connection_kwargs) as conn:
        checkpointer = PostgresSaver(conn)
        # NOTE: you need to call .setup() the first time you're using your checkpointer
        checkpointer.setup()
        graph = state_graph.compile(checkpointer=checkpointer)
        app.state.sdk = CopilotKitSDK(agents=[
            LangGraphAgentSync(
                name="chat-with-memory-agent",
                description="Agent that answers interact with human",
                graph=graph,
                langgraph_config=config,
            )
        ])
        yield

    # async with AsyncPostgresSaver.from_conn_string(DB_URI) as checkpointer:
    #     graph = state_graph.compile(checkpointer=checkpointer)
    #     app.state.sdk = CopilotKitSDKAsync(agents=[
    #         LangGraphAgentAsync(
    #             name="chat-with-memory-agent",
    #             description="Agent that answers interact with human",
    #             graph=graph,
    #             langgraph_config=config,
    #         )
    #     ])
    #     yield

# memory = MemorySaver()
# graph = state_graph.compile(checkpointer=memory)

app = FastAPI(
    title="LangGraph Server",
    version="1.0",
    description="A simple api server using CopilotSDK",
    lifespan=lifespan
)

# sdk = CopilotKitSDK(agents=[
#     LangGraphAgent(
#         name="chat-with-memory-agent",
#         description="Agent that answers interact with human",
#         graph=graph,
#         langgraph_config=config,
#     )
# ])

# add_fastapi_endpoint(app, sdk, "copilotkit_remote")

# def add_fastapi_endpoint( sdk: CopilotKitSDK, prefix: str):


def add_fastapi_endpoint(fastapi_app: FastAPI, prefix: str):
    """Add FastAPI endpoint"""
    async def make_handler(request: Request):
        return await handler(request, fastapi_app.state.sdk)

    # Ensure the prefix starts with a slash and remove trailing slashes
    normalized_prefix = '/' + prefix.strip('/')

    fastapi_app.add_api_route(
        f"{normalized_prefix}/{{path:path}}",
        make_handler,
        methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    )


add_fastapi_endpoint(app, "copilotkit_remote")
if __name__ == "__main__":
    main()
