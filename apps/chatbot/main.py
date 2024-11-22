import os
from fastapi import FastAPI
from copilotkit import CopilotKitSDK, LangGraphAgent, Action as CopilotAction
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from psycopg import AsyncConnection, Connection
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.checkpoint.memory import MemorySaver
from rag.memory import builder as state_graph

DB_URI = os.environ.get("PSQL_CONNECTION")
connection_kwargs = {
    "autocommit": True,
    "prepare_threshold": 0,
}
app = FastAPI(title="LangGraph Server",
              version="1.0",
              description="A simple api server using CopilotSDK",
              )


@app.on_event("startup")
async def setup():
    global sdk
    conn = await AsyncConnection.connect(DB_URI, **connection_kwargs)
    checkpointer = AsyncPostgresSaver(conn)
    config = {"configurable": {
        "user_id": "1", "thread_id": "chat_thread_1"}}
    graph = state_graph.compile(checkpointer=checkpointer)

    sdk = CopilotKitSDK(
        agents=[
            LangGraphAgent(
                name="chat-with-memory-agent",
                description="Agent that answers interact with human",
                graph=graph,
                langgraph_config=config,
            )
        ],
    )
    add_fastapi_endpoint(app, sdk, "copilotkit_remote")


def main():
    """Run the uvicorn server."""
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)


if __name__ == "__main__":
    main()
