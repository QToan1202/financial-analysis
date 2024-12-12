from langgraph.prebuilt import tools_condition
from langgraph.prebuilt import ToolNode
from langgraph.graph import START, END, StateGraph
from typing import Literal
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_core.output_parsers import BaseOutputParser
from copilotkit.langchain import copilotkit_customize_config
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableConfig
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from langchain_core.tools import tool
from langchain_community.tools.tavily_search import TavilySearchResults
import json
import numpy as np
import pandas as pd
import yfinance as yf
from langchain.schema import Document
from langgraph.graph import MessagesState
from typing import List
from langchain_postgres.vectorstores import PGVector
from langchain_nvidia_ai_endpoints import ChatNVIDIA, NVIDIAEmbeddings, NVIDIARerank
import os
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())


CONNECTION = os.environ.get("PGVT_CONNECTION")

COLLECTION_NAME = "documents"
DOCUMENT_RELEVANT_THRESHOLD = 0.7
RETRY_RETRIEVAL_COUNT = 0


llm = ChatNVIDIA(
    model="meta/llama-3.1-405b-instruct",
    temperature=0.0,
)

chat_model = ChatNVIDIA(
    model="meta/llama-3.1-405b-instruct",
    temperature=0.5,
)

ranking = NVIDIARerank(
    model="nvidia/nv-rerankqa-mistral-4b-v3",
    truncate="END"
)

embeddings = NVIDIAEmbeddings(
    model="nvidia/nv-embedqa-mistral-7b-v2",
    truncate="END"
)

vector_store = PGVector(
    embeddings=embeddings,
    collection_name=COLLECTION_NAME,
    connection=CONNECTION,
    use_jsonb=True,
)


class State(MessagesState):
    generation: str
    documents: List[Document]
    retry_count: int


# Search


web_search_tool = TavilySearchResults(name="web_search", k=3)


class FinancialDataSchema(BaseModel):
    ticker: str = Field(..., description="The stock ticker symbol for which financial data is being retrieved. Ex: APPL, NVDA,...", )


@tool(args_schema=FinancialDataSchema)
def get_financial_data(ticker: str) -> str:
    """A comprehensive tool designed to fetch detailed 
    financial information for a given stock ticker, 
    serving as a critical component in financial analysis and investment research. 
    Capabilities: 
    Retrieves real-time and historical financial data, 
    Provides in-depth financial metrics and insights,
    Designed for use in automated financial agents and analysis systems
    """
    current_date = datetime.today()
    target_date = datetime.today() - timedelta(weeks=1)
    stock = yf.Ticker(ticker)
    df = stock.history(start=target_date, end=current_date,
                       interval='1d', raise_errors=True)
    df['Trend'] = np.where(df['Close'].shift(-1) > df['Close'], "Up", "Down")
    result = df.sort_values(
        by=[df.index.name], ascending=False).to_dict('records')[0]
    json_output = json.dumps(result)

    return json_output


tools = [web_search_tool, get_financial_data]

# Utils def

# Util def to get all documents content


def format_docs(docs: List[Document]):
    return "\n\n".join(doc.page_content for doc in docs)


# Get user_id from config


def get_user_id(config: RunnableConfig) -> str:
    user_id = config["configurable"].get("user_id", "")
    if user_id is None:
        raise ValueError("User ID needs to be provided to save a memory.")

    return user_id


# Sigmoid activation function


def sigmoid(x: float):
    return 1 / (1 + np.exp(-x))


# Define Graph Nodes

# Output parser will split the LLM result into a list of queries

class LineListOutputParser(BaseOutputParser[List[str]]):
    """Output parser for a list of lines."""

    def parse(self, text: str) -> List[str]:
        lines = text.strip().split("\n")
        return list(filter(None, lines))  # Remove empty lines


def retrieve(state: State, config: RunnableConfig) -> State:
    """
    Retrieve documents

    Args:
        state (dict): The current graph state
        config (RunnableConfig): The runtime configuration for the agent.

    Returns:
        state (dict): New key added to state, documents, that contains retrieved documents
    """
    retry_count = state.get("retry_count", -1)
    last_message = state["messages"][-1]

    output_parser = LineListOutputParser()
    prompt = """Analyze the following query and provide only the specific topics 
    or keywords that should be retrieved from the vector store. 
    Focus solely on identifying the most relevant retrieval 
    targets without any explanation or commentary.

    Query: {question}

    Respond only with the optimal retrieval topics or keywords.
    """
    refinement_prompt = PromptTemplate.from_template(prompt)
    refinement_chain = refinement_prompt | llm | output_parser

    user_id = get_user_id(config)
    filter = {"user_id": {"$eq": user_id}}
    search_kwargs = {
        "k": 3,
        "fetch_k": 5,
        # "filter": filter
    }
    retriever = vector_store.as_retriever(search_type="mmr",
                                          search_kwargs=search_kwargs)
    multi_retriever = MultiQueryRetriever(
        retriever=retriever, llm_chain=refinement_chain)
    modified_config = copilotkit_customize_config(config, emit_messages=False)
    documents = multi_retriever.invoke(
        last_message.content, config=modified_config)

    return {"documents": documents, "retry_count": retry_count + 1}


def grade_documents(state: State) -> State:
    """
    Ranking documents

    Args:
        state (dict): The current graph state

    Returns:
        state: A list re-ranking documents related to user's query
    """
    messages = state["messages"]
    question = messages[-1].content
    document = state["documents"]

    # Using ranking model to filter irrelevant documents
    ranking_docs = ranking.compress_documents(
        query=question,
        documents=document,
    )
    ranking_docs = [doc for doc in ranking_docs if sigmoid(
        doc.metadata.get("relevance_score", 0.0)) >= DOCUMENT_RELEVANT_THRESHOLD]

    return {"documents": ranking_docs}


def agent(state: State) -> State:
    """
    Invokes the agent model to generate a response based on the current state. Given
    the question, it will decide to retrieve using the retriever tool, or simply end.

    Args:
        state (messages): The current state

    Returns:
        dict: The updated state with the agent response appended to messages
    """
    query = state["messages"][-1]
    context = state.get("generation", "No context provided")
    react_agent_prompt = """You are a sophisticated AI agent with advanced contextual analysis capabilities and access to specialized tools.
      CORE OBJECTIVES:
      - Provide comprehensive and accurate answers based on given context
      - Leverage multiple tools strategically:
        * Financial Data Retrieval Tool (get_financial_data)
        * Tavily Search Tool (web_search)
      - Enhance response depth through intelligent tool integration

      TOOL UTILIZATION PROTOCOL:
      1. Analyze the provided context and user query comprehensively
      2. Identify knowledge gaps or areas requiring additional information
      3. Strategically invoke tools in this priority order:
        a) Use provided context first
        b) Utilize Tavily search for supplementary information
        c) Retrieve financial data if relevant
      4. Synthesize information from all sources

      TOOL INTERACTION STRATEGY:
      - TAVILY SEARCH:
        * Use for gathering real-time or additional contextual information
        * Perform targeted searches to fill knowledge gaps
        * Extract most relevant and recent information

      - FINANCIAL DATA TOOL:
        * Automatically trigger for financial, business, or company-related queries
        * Extract key financial metrics and insights
        * Provide contextualized financial analysis

      RESPONSE GENERATION GUIDELINES:
      - Ensure seamless integration of information from all sources
      - Clearly attribute information to its source
      - Maintain high standards of accuracy and relevance
      - Provide nuanced, well-reasoned insights

      ANALYTICAL PRINCIPLES:
      - Prioritize context-driven analysis
      - Maintain transparency about information sources
      - Avoid speculative or unsupported claims
      - Provide balanced, objective interpretation

      ERROR HANDLING:
      - If tools provide limited or conflicting information:
        * Clearly communicate sources and limitations
        * Focus on most reliable and consistent information
        * Suggest areas for further investigation

      RESPONSE STRUCTURE:
      1. Preliminary Analysis: Initial insights from context
      2. Tool Interactions: Summary of search and data retrieval
      3. Synthesized Response: Comprehensive answer integrating all sources

      CONTEXT: {context}
      QUERY: {query}

      BEGIN ANALYSIS"""
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", react_agent_prompt),
        ("placeholder", "{messages}")
    ])
    model = chat_model.bind_tools(tools)
    chain = prompt_template | model
    response = chain.invoke(
        {"context": context, "query": query.content, "messages": state["messages"]})

    return {"messages": [response]}


def rewrite(state: State, config: RunnableConfig) -> State:
    """
    Transform the query to produce a better question.

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): Updates question key with a re-phrased question
    """
    question = state["messages"][-1].content
    human_msg = [
        ("human", """You a question re-writer that converts an input question to a better version that is optimized,
        for vectorstore retrieval. Look at the input and try to reason about the underlying semantic intent / meaning.
        Here is the information you need to know:
        INIT QUESTION: {question}
        IMPROVED QUESTION:

        CAVEAT: Only give back the final question
        """)
    ]
    prompt = ChatPromptTemplate.from_messages(human_msg) | chat_model
    modified_config = copilotkit_customize_config(config, emit_messages=False)
    improved_question = prompt.invoke(
        {"question": question}, config=modified_config)

    return {"messages": [improved_question]}


def generate(state: State, config: RunnableConfig) -> State:
    """
    Generate answer

    Args:
        state (dict): The current graph state
        config (RunnableConfig): Config pass through graph

    Returns:
        state (dict): New key added to state, generation, that contains LLM generation
    """
    question = state["messages"][-1].content
    docs = state["documents"]

    rag_prompt = """You are an assistant for question-answering tasks. 
              Use the following pieces of retrieved context to answer the question. 
              If you don't know the answer, just say that you don't know. 
              Use three sentences maximum and keep the answer concise.
              Question: <question>\n{question}\n</question>
              Context: <context>\n{context}\n</context>
              Answer: 
              """
    generate_prompt = ChatPromptTemplate.from_template(rag_prompt)
    rag_chain = generate_prompt | chat_model | StrOutputParser()
    modified_config = copilotkit_customize_config(config, emit_messages=False)
    generation = rag_chain.invoke({"context": format_docs(
        docs), "question":  question}, config=modified_config)

    return {"generation": generation}


# Edges


def decide_generate(state: State) -> Literal["transform", "available"]:
    """
    Determines whether the retrieved documents are relevant to the question.

    Args:
        state (dict): The current graph state

    Returns:
        str: A decision for whether the documents are relevant or not
    """
    document = state["documents"]

    if not document:
        return "transform"
    else:
        return "available"


def decide_retrieve(state: State) -> Literal["unavailable", "retrieve"]:
    """
    Determines whether the retrieved documents are relevant to the question.

    Args:
        state (dict): The current graph state

    Returns:
        str: A decision for whether the documents are relevant or not
    """
    retry_count = state["retry_count"]

    if retry_count >= RETRY_RETRIEVAL_COUNT:
        return "unavailable"
    else:
        return "retrieve"


workflow = StateGraph(State)

# Define the nodes
workflow.add_node("retrieve", retrieve)
workflow.add_node("grade_documents", grade_documents)
workflow.add_node("generate", generate)
workflow.add_node("rewrite", rewrite)
workflow.add_node("research-agent", agent)
workflow.add_node("tools", ToolNode(tools))

# Build graph
workflow.add_edge(START, "retrieve")
workflow.add_edge("retrieve", "grade_documents")
workflow.add_conditional_edges("grade_documents", decide_generate, {
    "transform": "rewrite",
    "available": "generate",
})
workflow.add_conditional_edges("rewrite", decide_retrieve, {
    "unavailable": "research-agent",
    "retrieve": "retrieve",
})
workflow.add_edge("generate", "research-agent")
workflow.add_conditional_edges(
    "research-agent",
    tools_condition,
    {
        "tools": "tools",
        END: END
    }
)
workflow.add_edge("tools", "research-agent")

# Compile
app = workflow.compile()
