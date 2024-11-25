import uuid
import json

from copilotkit import LangGraphAgent
from copilotkit.langgraph_agent import _StreamingStateExtractor
from copilotkit.types import Message
from copilotkit.action import ActionDict

from typing import Optional, List, Callable, cast, Any

from langchain_core.runnables import RunnableConfig, ensure_config
from langchain.load.dump import dumps as langchain_dumps


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

        state = await self.graph.aget_state(config)
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

    def _emit_state_sync_event(
        self,
        *,
        thread_id: str,
        run_id: str,
        node_name: str,
        state: dict,
        running: bool,
        active: bool
    ):
        if isinstance(state, dict) is not True:
            state = state.values

        state_without_messages = {
            k: v for k, v in state.items() if k != "messages"
        }
        return langchain_dumps({
            "event": "on_copilotkit_state_sync",
            "thread_id": thread_id,
            "run_id": run_id,
            "agent_name": self.name,
            "node_name": node_name,
            "active": active,
            "state": state_without_messages,
            "running": running,
            "role": "assistant"
        })
