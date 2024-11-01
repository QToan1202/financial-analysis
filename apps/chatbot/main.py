import os
import bs4
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_community.document_loaders import WebBaseLoader
from langchain_text_splitters import TokenTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

from typing import List
from langchain_core.documents import Document

from utils import (config_env)
from vector_store import VectorStoreHelper
from utils import TextProcessor


def load_docs() -> List[Document]:
    loader = WebBaseLoader(web_paths=("https://lilianweng.github.io/posts/2023-06-23-agent/",),
                           bs_kwargs=dict(parse_only=bs4.SoupStrainer(class_=("post-content", "post-title", "post-header"))))

    docs = loader.load()
    text_preprocess = TextProcessor()
    for doc in docs:
        doc.page_content = text_preprocess.preprocessing(doc.page_content)

    text_splitter = TokenTextSplitter(
        chunk_size=200, chunk_overlap=15)
    splits = text_splitter.split_documents(docs)

    return splits


def format_docs(docs):
    print(f"LENGTH OF RELATIVE DOCS: {len(docs)}")
    return "\n\n".join(doc.page_content for doc in docs)


def main():
    config_env()

    chat_model = ChatNVIDIA(
        model="meta/llama-3.1-405b-instruct",
        api_key=os.environ["NVIDIA_API_KEY"],
        temperature=0.0,
    )

    vector_store_helper = VectorStoreHelper(search_index_name="rag")
    # vector_store_helper.clear_data()
    vector_store_helper.create_vector_search_index(
        'rag', [{"type": "filter", "path": "source"}])
    vector_store = vector_store_helper.get_vector_store()

    # vector_store_helper.add_data(doc=load_docs())

    base_retriever = vector_store.as_retriever(search_type="mmr",
                                               search_kwargs={'k': 3, 'fetch_k': 5})
    # compressor = LLMChainExtractor.from_llm(chat_model)
    # compression_retriever = ContextualCompressionRetriever(
    #     base_compressor=compressor, base_retriever=base_retriever)

    prompt_template_str = """
      You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
      Question: {question}
      Context: {context}
      Answer:
    """

    prompt_template = ChatPromptTemplate.from_template(prompt_template_str)
    rag_chain = {"context": base_retriever | format_docs, "question": RunnablePassthrough(
    )} | prompt_template | chat_model | StrOutputParser()

    result = rag_chain.invoke(
        "How Self-reflection help autonomous agents to improve?")
    # result = compression_retriever.invoke(
    #   "How Self-reflection help autonomous agents to improve?")
    print(result)


if __name__ == '__main__':
    main()
