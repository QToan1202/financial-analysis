import sys
import asyncio
import os
from fastapi import FastAPI
from copilotkit import CopilotKitSDK, LangGraphAgent
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from psycopg import AsyncConnection, Connection
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
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

if sys.platform:
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

sdk: None | CopilotKitSDK = None


async def setup():
    global sdk
    conn = await AsyncConnection.connect(DB_URI, **connection_kwargs)
    checkpointer = AsyncPostgresSaver(conn)
    config = {"configurable": {
        "user_id": "1", "thread_id": "chat_thread_1"}}
    graph = state_graph.compile(checkpointer=checkpointer)

    sdk = CopilotKitSDK(agents=[
        LangGraphAgent(
            name="chat-with-memory-agent",
            description="Agent that answers interact with human",
            graph=graph,
            langgraph_config=config,
        )
    ])


asyncio.run(setup())
add_fastapi_endpoint(app, sdk, "copilotkit_remote")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)
