import os
from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from pymongo import MongoClient
from pymongo.operations import SearchIndexModel
from typing import (List, Optional, Any)
from langchain_core.documents import Document
from dotenv import load_dotenv, find_dotenv

import warnings
warnings.filterwarnings('ignore')


class VectorStoreHelper:
    DB_NAME = "langchain_test_db"
    COLLECTION_NAME = "langchain_test_vectorstores"
    ATLAS_VECTOR_SEARCH_INDEX_NAME = "langchain-test-index-vectorstores"

    def __init__(self, db_name: Optional[str] = DB_NAME, collection_name: Optional[str] = COLLECTION_NAME, search_index_name: Optional[str] = ATLAS_VECTOR_SEARCH_INDEX_NAME):
        _ = load_dotenv(find_dotenv())
        self.embedding = NVIDIAEmbeddings(
            model="nvidia/llama-3.2-nv-embedqa-1b-v1",
            nvidia_api_key=os.getenv("NVIDIA_API_KEY"))
        self.dimension = len(self.embedding.embed_query(
            "Testing embedding dimension"))
        self.mongo_client = MongoClient(
            os.environ["MONGODB_ATLAS_CLUSTER_URI"])
        self.collection = self.mongo_client[db_name][collection_name]
        self.search_index_name = search_index_name

    def create_vector_search_index(self, search_index_name: str = ATLAS_VECTOR_SEARCH_INDEX_NAME, filter: Optional[List[str]] = None):
        existing_search_indexes = self.collection.list_search_indexes()

        for index in existing_search_indexes:
            if index["name"] == search_index_name:
                print(
                    f"Index '{search_index_name}' already exist. Skip create index")
                return

        self.search_index_name = search_index_name
        search_def = {
            "fields": [
                {
                    "type": "vector",
                    "numDimensions":  self.dimension,
                    "path": "embedding",
                    "similarity": "cosine"
                }
            ]
        }

        if (filter is not None):
            search_def["fields"].extend(filter)

        search_index_model = SearchIndexModel(
            definition=search_def, name=search_index_name, type="vectorSearch")
        self.collection.create_search_index(
            model=search_index_model)
        print(f"Created index: {search_index_name}")

    def get_embedding(self, data: str):
        embedding = self.embedding.embed_documents([data])

        return embedding.pop()

    def add_data(self, doc: List[Document]):
        parse_docs = [{
            "text": d.page_content,
            "embedding": self.get_embedding(d.page_content)
        } for d in doc]
        result = self.collection.insert_many(documents=parse_docs)
        print(result)

    def clear_data(self):
        result = self.collection.delete_many({})
        print(result)

    def get_vector_store(self):
        vector_store = MongoDBAtlasVectorSearch(collection=self.collection, embedding=self.embedding,
                                                index_name=self.search_index_name, relevance_score_fn="cosine")

        return vector_store
