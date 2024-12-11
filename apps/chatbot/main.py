from typing import Annotated
import os
import warnings
from dotenv import load_dotenv, find_dotenv

from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings
from langchain_postgres import PGVector

from fastapi import FastAPI, UploadFile, HTTPException, File, Form
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from copilotkit_sdk_async import CopilotKitSDKAsync
from langgraph_agent_async import LangGraphAgentAsync

from file_handler_service import FileService
from rag.memory import builder as state_graph
from rag.memory import *
# from agent import workflow as state_graph
from api import add_fastapi_endpoint

DB_URI = os.environ.get("PSQL_CONNECTION")
connection_kwargs = {
    "autocommit": True,
    "prepare_threshold": 0,
}
connection = os.environ.get("PGVT_CONNECTION")
collection_name = "documents"

_ = load_dotenv(find_dotenv())
warnings.filterwarnings('ignore')


@asynccontextmanager
async def lifespan(app: FastAPI):
    embeddings = NVIDIAEmbeddings(
        model="nvidia/nv-embedqa-mistral-7b-v2",
        truncate="END")
    app.state.vector_store = PGVector(
        embeddings=embeddings,
        collection_name=collection_name,
        connection=connection,
        use_jsonb=True,
    )
    async with AsyncPostgresSaver.from_conn_string(DB_URI) as checkpointer:
        checkpointer.setup()
        graph = state_graph.compile(checkpointer=checkpointer)
        app.state.sdk = CopilotKitSDKAsync(agents=[
            LangGraphAgentAsync(
                name="chat-with-memory-agent",
                description="Agent that answers interact with human",
                graph=graph,
            )
        ])
        yield

app = FastAPI(
    title="LangGraph Server",
    version="1.0",
    description="A simple api server using CopilotSDK",
    lifespan=lifespan
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


add_fastapi_endpoint(app, "copilotkit_remote")


@app.post("/upload")
async def create_upload_file(user_id: Annotated[str, Form()], file: UploadFile = File(...)):
    try:
        contents = await file.read()
        ext = file.filename.split('.')[1]
        service = FileService(content=contents, file_extension=ext)
        documents = service.handle_split_file_content(metadata={
            "filename": file.filename, "size": file.size, "type": file.content_type, "user_id": user_id})
        ids = app.state.vector_store.add_documents(documents)

        return {"filename": file.filename, "file_ids": ids, "message": "Upload file success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class Item(BaseModel):
    ids: List[str]


@app.post("/delete-document")
async def delete_document(body: Item):
    try:
        app.state.vector_store.delete(ids=body.ids)

        return {"message": "Delete document success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def main():
    """Run the uvicorn server."""
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)


if __name__ == "__main__":
    main()
