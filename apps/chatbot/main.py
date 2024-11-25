import os
from fastapi import FastAPI, Request
from contextlib import asynccontextmanager

from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from copilotkit_sdk_async import CopilotKitSDKAsync
from langgraph_agent_async import LangGraphAgentAsync

from rag.memory import builder as state_graph
from rag.memory import *
# from agent import workflow as state_graph
from api import add_fastapi_endpoint

DB_URI = os.environ.get("PSQL_CONNECTION")
connection_kwargs = {
    "autocommit": True,
    "prepare_threshold": 0,
}

config = {"configurable": {
    "user_id": "1", "thread_id": "4"}}


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with AsyncPostgresSaver.from_conn_string(DB_URI) as checkpointer:
        graph = state_graph.compile(checkpointer=checkpointer)
        app.state.sdk = CopilotKitSDKAsync(agents=[
            LangGraphAgentAsync(
                name="chat-with-memory-agent",
                description="Agent that answers interact with human",
                graph=graph,
                langgraph_config=config,
            )
        ])
        yield

app = FastAPI(
    title="LangGraph Server",
    version="1.0",
    description="A simple api server using CopilotSDK",
    lifespan=lifespan
)

add_fastapi_endpoint(app, "copilotkit_remote")


def main():
    """Run the uvicorn server."""
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)


if __name__ == "__main__":
    main()
