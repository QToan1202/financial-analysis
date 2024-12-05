from typing import Literal
from langgraph.graph import END, StateGraph, START

from typing_extensions import TypedDict
from typing import List
from pydantic import BaseModel, Field

from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnableConfig
from langchain.schema import Document
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings
from langchain_postgres.vectorstores import PGVector

import warnings
import os
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())
warnings.filterwarnings('ignore')


CONNECTION = os.environ.get("PGVT_CONNECTION")
COLLECTION_NAME = "documents"

llm = ChatNVIDIA(
    model="meta/llama-3.1-405b-instruct",
    temperature=0.0,
)

# Route query


class RouteQuery(BaseModel):
    """
    A model representing a routing decision for user queries. 
    Determines whether a query is processed via RAG (Retrieval-Augmented Generation) 
    or handled as a regular chatbot conversation.
    """

    route: Literal["RAG", "Chatbot"] = Field(
        ..., description="The determined route for processing: 'RAG' or 'Chatbot'.")


llm = ChatNVIDIA(
    model="meta/llama-3.1-405b-instruct",
    temperature=0.0,
)
structured_llm_router = llm.with_structured_output(RouteQuery)
system = """
You are a smart router determining whether to process a user's input using the RAG retrieval system or 
handle it as a conversational response from the chatbot. Follow these steps:

  1. Use the RAG process if the input. 
     * Requires detailed factual retrieval from a specific knowledge base or document.
     * Mentions topics not covered by the chatbot's general knowledge or external tools

     Examples include:
      * 'What is the financial projection for Q3 2024?'
      * 'Summarize the company's annual report.'
      * 'Retrieve details about document X.'

  2. Handle it as a chatbot interaction if the input. 
     * Seeks up-to-date information such as weather, current events, or trending topics (use the web search tool as needed).
     * Relates to user-specific references that can be resolved using long-term memory.
     * Involves casual conversation, creative tasks, or opinion-based queries

     Examples include:
      * 'What's the weather like in DaNang today?'
      * 'Tell me a joke.'
      * 'Hi'

Output:
  * If RAG is needed, respond with: "RAG"
  * If it's a regular conversation, respond directly as a "Chatbot"
"""

route_prompt = ChatPromptTemplate.from_messages(
    [("system", system), ("human", "{question}")])

route_chain = route_prompt | structured_llm_router

# Retrieval Grader


class GradeDocuments(BaseModel):
    """Binary score for relevance check on retriever documents."""

    binary_score: str = Field(
        description="Documents are relevant to the question, 'yes' or 'no'")


llm = ChatNVIDIA(
    model="meta/llama-3.1-405b-instruct",
    api_key=os.environ["NVIDIA_API_KEY"],
    temperature=0.0,
)
structured_llm_grader = llm.with_structured_output(GradeDocuments)

system_prompt = """You are a grader assessing relevance of a retrieved document to a user question. \n 
    It does not need to be a stringent test. The goal is to filter out erroneous retrievals. \n
    If the document contains keyword(s) or semantic meaning related to the user question, grade it as relevant. \n
    Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question."""
human_prompt = "Retrieved document: \n\n {document} \n\n User question: {question}"
grade_prompt = ChatPromptTemplate.from_messages(
    [("system", system_prompt), ("human", human_prompt)])
retrieval_grader = grade_prompt | structured_llm_grader


# Generate
rag_prompt = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.\n
          Question: {question}\n
          Context: {context}\n
          Answer: """
generate_prompt = ChatPromptTemplate.from_template(rag_prompt)
rag_chain = generate_prompt | llm | StrOutputParser()


# Hallucination Grader
class GradeHallucinations(BaseModel):
    """Binary score for hallucination present in generation answer."""

    binary_score: str = Field(
        description="Answer is grounded in the facts, 'yes' or 'no'")


structured_llm_grader = llm.with_structured_output(GradeHallucinations)

system_prompt = """You are a grader assessing whether an LLM generation is grounded in / supported by a set of retrieved facts. \n 
     Give a binary score 'yes' or 'no'. 'Yes' means that the answer is grounded in / supported by the set of facts."""
human_prompt = "Set of facts: \n\n {documents} \n\n LLM generation: {generation}"
hallucination_prompt = ChatPromptTemplate.from_messages(
    [("system", system_prompt), ("human", human_prompt)])
hallucination_grader = hallucination_prompt | structured_llm_grader


# Answer Grader
class GradeAnswer(BaseModel):
    """Binary score to assess answer addresses question."""

    binary_score: str = Field(
        description="Answer addresses the question, 'yes' or 'no'")


structured_llm_grader = llm.with_structured_output(GradeAnswer)

system_prompt = """You are a grader assessing whether an answer addresses / resolves a question \n 
     Give a binary score 'yes' or 'no'. 'Yes' means that the answer resolves the question."""
human_prompt = "User question: \n\n {question} \n\n LLM generation: {generation}"
answer_prompt = ChatPromptTemplate.from_messages(
    ["system", system_prompt, ("human", human_prompt)])
answer_grader = answer_prompt | structured_llm_grader


# Question Re-writer
system_prompt = """You a question re-writer that converts an input question to a better version that is optimized,
     for vectorstore retrieval. Look at the input and try to reason about the underlying semantic intent / meaning.
     Here is the information you need to know:
     INIT QUESTION: {question}./
     IMPROVED QUESTION: \n

     CAVEAT: Only give back the final question
     """
re_write_prompt = PromptTemplate.from_template(system_prompt)
question_rewriter = re_write_prompt | llm | StrOutputParser()


class State(TypedDict):
    question: str
    generation: str
    documents: List[Document]


def get_user_id(config: RunnableConfig) -> str:
    user_id = config["configurable"].get("user_id", "")
    if user_id is None:
        raise ValueError("User ID needs to be provided to save a memory.")

    return user_id

# Util def to get all documents content


def format_docs(docs: List[Document]):
    return "\n\n".join(doc.page_content for doc in docs)


# Define Graph Nodes


def retrieve(state: State, config: RunnableConfig) -> State:
    """
    Retrieve documents

    Args:
        state (dict): The current graph state
        config (RunnableConfig): The runtime configuration for the agent.

    Returns:
        state (dict): New key added to state, documents, that contains retrieved documents
    """
    embeddings = NVIDIAEmbeddings(
        model="nvidia/llama-3.2-nv-embedqa-1b-v1",
        truncate="END")

    vector_store = PGVector(
        embeddings=embeddings,
        collection_name=COLLECTION_NAME,
        connection=CONNECTION,
        use_jsonb=True,
    )
    user_id = get_user_id(config)
    filter = {"user_id": {"$eq": user_id}}
    search_kwargs = {
        "k": 3,
        "fetch_k": 5,
        "filter": filter
    }
    retriever = vector_store.as_retriever(search_type="mmr",
                                          search_kwargs=search_kwargs)
    question = state["question"]
    documents = retriever.invoke(question)

    return {"documents": documents, "question": question}


def generate(state: State) -> State:
    """
    Generate answer

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): New key added to state, generation, that contains LLM generation
    """
    question = state["question"]
    documents = state["documents"]
    generation = rag_chain.invoke(
        {"context": format_docs(documents), "question":  question})

    return {"documents": documents, "question": question, "generation": generation}


def grade_documents(state: State) -> State:
    """
    Determines whether the retrieved documents are relevant to the question.

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): Updates documents key with only filtered relevant documents
    """
    question = state["question"]
    documents = state["documents"]

    prep = RunnableLambda(
        lambda x: [{"document": doc.page_content, "question": x["question"]}
                   for doc in x["document"]]
    )

    parallel_chain = prep | retrieval_grader.map()
    grade_docs = parallel_chain.invoke(
        {"question": question, "document": documents})
    filtered_docs = []

    for idx, score in enumerate(grade_docs):
        grade = score.binary_score
        if grade == "yes":
            filtered_docs.append(documents[idx])
        else:
            continue

    return {"documents": filtered_docs, "question": question}


def transform_query(state: State) -> State:
    """
    Transform the query to produce a better question.

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): Updates question key with a re-phrased question
    """
    question = state["question"]
    improved_question = question_rewriter.invoke({"question": question})

    return {"question": improved_question}


# Edges
def route_question(state):
    """
    Route question to Chatbot or RAG.

    Args:
        state (dict): The current graph state

    Returns:
        str: Next node to call
    """
    question = state["question"]
    source = route_chain.invoke({"question": question})

    return source.route


def decide_to_generate(state):
    """
    Determines whether to generate an answer, or re-generate a question.

    Args:
        state (dict): The current graph state

    Returns:
        str: Binary decision for next node to call
    """
    state["question"]
    filtered_documents = state["documents"]

    if not filtered_documents:
        # All documents have been filtered check_relevance
        # We will re-generate a new query
        return "transform_query"
    else:
        # We have relevant documents, so generate answer
        return "generate"


def grade_generation_v_documents_and_question(state):
    """
    Determines whether the generation is grounded in the document and answers question.

    Args:
        state (dict): The current graph state

    Returns:
        str: Decision for next node to call
    """
    question = state["question"]
    documents = state["documents"]
    generation = state["generation"]

    score = hallucination_grader.invoke(
        {"documents": format_docs(documents), "generation": generation}
    )
    grade = score.binary_score

    # Check hallucination
    if grade == "yes":
        # Check question-answering
        score = answer_grader.invoke(
            {"question": question, "generation": generation})
        grade = score.binary_score
        if grade == "yes":
            return "useful"
        else:
            return "not useful"
    else:
        return "not supported"


workflow = StateGraph(State)

# Define the nodes
workflow.add_node("retrieve", retrieve)
workflow.add_node("grade_documents", grade_documents)
workflow.add_node("generate", generate)
workflow.add_node("transform_query", transform_query)

# Build graph
workflow.add_conditional_edges(
    START,
    route_question,
    {
        "Chatbot": END,
        "RAG": "retrieve",
    },
)
workflow.add_edge("retrieve", "grade_documents")
workflow.add_conditional_edges(
    "grade_documents",
    decide_to_generate,
    {
        "transform_query": "transform_query",
        "generate": "generate",
    },
)
workflow.add_edge("transform_query", "retrieve")
workflow.add_conditional_edges(
    "generate",
    grade_generation_v_documents_and_question,
    {
        "not supported": "generate",
        "useful": END,
        "not useful": "transform_query",
    },
)

# Compile
app = workflow.compile()

# Run
# config = {"configurable": {"thread_id": "rag_thread", "user_id": "1"}}
# inputs = "What are is CoT?"
# out = app.invoke({"question": inputs}, config=config)
