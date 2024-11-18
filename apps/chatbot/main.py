import os
from fastapi import FastAPI
from copilotkit import CopilotKitSDK, LangGraphAgent
from copilotkit.integrations.fastapi import add_fastapi_endpoint

from rag import builder, MongoDBSaver

app = FastAPI(title="LangGraph Server",
              version="1.0",
              description="A simple api server using CopilotSDK",
              )


checkpoint = MongoDBSaver.from_conn_info(host=os.environ.get(
    "MONGODB_ATLAS_CLUSTER_URI"), db_name="langchain_test_db")
graph = builder.compile(checkpointer=checkpoint)
config = {"configurable": {"user_id": "1", "thread_id": "chat_thread_1"}}

sdk = CopilotKitSDK(agents=[
    LangGraphAgent(
        name="chat-with-memory-agent",
        description="Agent that answers interact with human",
        graph=graph,
        config=config
    )
])

add_fastapi_endpoint(app, sdk, "copilotkit_remote")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)
