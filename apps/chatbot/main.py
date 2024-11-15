#!/usr/bin/env python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langserve import add_routes
from rag import builder, AsyncMongoDBSaver, MongoDBSaver
import os

app = FastAPI(
    title="LangChain Server",
    version="1.0",
    description="A simple api server using Langchain's Runnable interfaces",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

checkpoint = MongoDBSaver.from_conn_info(host=os.environ.get(
    "MONGODB_ATLAS_CLUSTER_URI"), db_name="langchain_test_db")
graph = builder.compile(checkpointer=checkpoint)
config = {"configurable": {
    "user_id": "1", "thread_id": "chat_thread_1"}}

add_routes(
    app,
    graph,
    config_keys=("configuration"),
    path="/chat",
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)
