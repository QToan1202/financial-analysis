import sys
import asyncio

if sys.platform.startswith('win'):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from psycopg import AsyncConnection
from langchain_core.messages import RemoveMessage
from pydantic import BaseModel, Field
import uuid
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.checkpoint.postgres import PostgresSaver
import warnings
from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings
from langchain_postgres.vectorstores import PGVector
from langchain_postgres import PGVector
import os
from typing import List, Literal
from dotenv import load_dotenv, find_dotenv

import tiktoken
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.documents import Document
from langchain_core.messages import get_buffer_string, HumanMessage, AIMessageChunk
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode


_ = load_dotenv(find_dotenv())

warnings.filterwarnings('ignore')

connection = os.environ.get("PGVT_CONNECTION")
collection_name = "documents"

embeddings = NVIDIAEmbeddings(
    model="nvidia/llama-3.2-nv-embedqa-1b-v1",
    truncate="END")

recall_vector_store = vector_store = PGVector(
    embeddings=embeddings,
    collection_name=collection_name,
    connection=connection,
    use_jsonb=True,
)


DB_URI = os.environ.get("PSQL_CONNECTION")
connection_kwargs = {
    "autocommit": True,
    "prepare_threshold": 0,
}


def get_user_id(config: RunnableConfig) -> str:
    user_id = config["configurable"].get("user_id", "")
    if user_id is None:
        raise ValueError("User ID needs to be provided to save a memory.")

    return user_id


class SaveRecallMemory(BaseModel):
    memory: str = Field(..., description="A string containing information from the user, such as facts, experiences, or instructions, which will be analyzed and saved as a memory")


@tool(args_schema=SaveRecallMemory)
def save_recall_memory(memory: str, config: RunnableConfig) -> str:
    """This function is designed to capture and save user-related memories. 
    It should be called when the user's query provides new information about their facts,
    experiences, or specific instructions. Saving these memories enables the chat model 
    to offer personalized and context-aware responses in future interactions"""
    user_id = get_user_id(config)
    document = Document(
        page_content=memory, id=str(uuid.uuid4()), metadata={"user_id": user_id}
    )
    recall_vector_store.add_documents([document])
    return memory


class SearchRecallMemory(BaseModel):
    query: str = Field(..., description="A string representing the search input, which may include references to user-provided facts, experiences, or instructions")


@tool(args_schema=SearchRecallMemory)
def search_recall_memories(query: str, config: RunnableConfig) -> str:
    """searches for related memories based on a given query.
    It specifically identifies and retrieves user-related facts, experiences, 
    or instructions that are relevant to the query. The purpose is to 
    enhance contextual understanding and 
    provide more personalized or context-aware responses"""
    user_id = get_user_id(config)
    filter = {"user_id": {"$eq": user_id}}
    search_kwargs = {
        "k": 3,
        "fetch_k": 5,
        "filter": filter
    }

    documents = recall_vector_store.as_retriever(search_type="mmr",
                                                 search_kwargs=search_kwargs).invoke(query)

    for doc in documents:
        print(f"* {doc.page_content} [{doc.metadata}]")

    return "\n".join(document.page_content for document in documents)


search = TavilySearchResults(max_results=1)
tools = [save_recall_memory, search_recall_memories, search]


class State(MessagesState):
    # add memories that will be retrieved based on the conversation context
    recall_memories: List[str]


# Define the prompt template for the agent
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant with advanced long-term memory"
            " capabilities. Powered by a stateless LLM, you must rely on"
            " external memory to store information between conversations."
            " Utilize the available memory tools to store and retrieve"
            " important details that will help you better attend to the user's"
            " needs and understand their context.\n\n"
            "Memory Usage Guidelines:\n"
            "1. Actively use memory tools (save_recall_memory, search_recall_memories)"
            " to build a comprehensive understanding of the user.\n"
            "2. Make informed suppositions and extrapolations based on stored"
            " memories.\n"
            "3. Regularly reflect on past interactions to identify patterns and"
            " preferences.\n"
            "4. Update your mental model of the user with each new piece of"
            " information.\n"
            "5. Cross-reference new information with existing memories for"
            " consistency.\n"
            "6. Prioritize storing emotional context and personal values"
            " alongside facts.\n"
            "7. Use memory to anticipate needs and tailor responses to the"
            " user's style.\n"
            "8. Recognize and acknowledge changes in the user's situation or"
            " perspectives over time.\n"
            "9. Leverage memories to provide personalized examples and"
            " analogies.\n"
            "10. Recall past challenges or successes to inform current"
            " problem-solving.\n\n"
            "## Recall Memories\n"
            "Recall memories are contextually retrieved based on the current"
            " conversation:\n{recall_memories}\n\n"
            "## Instructions\n"
            "Engage with the user naturally, as a trusted colleague or friend."
            " There's no need to explicitly mention your memory capabilities."
            " Instead, seamlessly incorporate your understanding of the user"
            " into your responses. Be attentive to subtle cues and underlying"
            " emotions. Adapt your communication style to match the user's"
            " preferences and current emotional state. Use tools to persist"
            " information you want to retain in the next conversation. If you"
            " do call tools, all text preceding the tool call is an internal"
            " message. Respond AFTER calling the tool, once you have"
            " confirmation that the tool completed successfully. \n\n",
        ),
        ("placeholder", "{messages}"),
    ]
)


model = chat_model = ChatNVIDIA(
    model="meta/llama-3.1-405b-instruct",
    temperature=0.5,
)

model_with_tools = model.bind_tools(tools=tools)
bound = prompt | model_with_tools
tokenizer = tiktoken.encoding_for_model("gpt-4o")


async def agent(state: State) -> State:
    """Process the current state and generate a response using the LLM.

    Args:
        state (schemas.State): The current state of the conversation.

    Returns:
        schemas.State: The updated state with the agent's response.
    """
    memories = state.get("recall_memories") or ""
    recall_str = (
        "<recall_memory>\n" + memories + "\n</recall_memory>"
    )
    prediction = await bound.ainvoke(
        {
            "messages": state["messages"],
            "recall_memories": recall_str,
        }
    )
    return {
        "messages": [prediction],
    }


def load_memories(state: State, config: RunnableConfig) -> State:
    """Load memories for the current conversation.

    Args:
        state (schemas.State): The current state of the conversation.
        config (RunnableConfig): The runtime configuration for the agent.

    Returns:
        State: The updated state with loaded memories.
    """
    msg = [state["messages"][-1]]
    convo_str = get_buffer_string(msg)
    convo_str = tokenizer.decode(tokenizer.encode(convo_str)[:2048])
    recall_memories = search_recall_memories.invoke(convo_str, config)

    return {
        "recall_memories": recall_memories,
    }


def delete_messages(state: State) -> State:
    messages = state["messages"]
    if len(messages) > 12:
        return {"messages": [RemoveMessage(msg.id) for msg in messages[:-12]]}

    return {"messages": messages}


def route_tools(state: State) -> Literal["tools", "delete_messages"]:
    """Determine whether to use tools or end the conversation based on the last message.

    Args:
        state (schemas.State): The current state of the conversation.

    Returns:
        Literal["tools", "delete_messages"]: The next step in the graph.
    """

    msg = state["messages"][-1]
    if msg.tool_calls:
        return "tools"

    return "delete_messages"


async def pretty_print_stream_chunk(msg):
    if isinstance(msg, AIMessageChunk):
        print(msg.content, end="", flush=True)
        if msg.response_metadata.get("finish_reason", "") == "stop":
            print("\n")
    else:
        print(msg.content)
        print("\n")

# Create the graph and add nodes


builder = StateGraph(State)
# builder.add_node(load_memories)
builder.add_node(delete_messages)
builder.add_node(agent)
builder.add_node("tools", ToolNode(tools))

# Add edges to the graph
# builder.add_edge(START, "load_memories")
builder.add_edge(START, "agent")
builder.add_conditional_edges(
    "agent", route_tools, ["tools", "delete_messages"])
builder.add_edge("tools", "agent")
builder.add_edge("delete_messages", END)


async def main():
    conn = await AsyncConnection.connect(DB_URI, **connection_kwargs)
    checkpointer = AsyncPostgresSaver(conn)
    checkpointer.setup()
    graph = builder.compile(checkpointer=checkpointer)
    config = {"configurable": {
        "user_id": "1", "thread_id": "chat_thread_1"}}

    while True:
        query = input("Enter messages: ")
        if query == 'stop':
            break
        async for msg, metadata in graph.astream({"messages": [HumanMessage(query)]}, config=config, stream_mode="messages"):
            await pretty_print_stream_chunk(msg)

    messages = await graph.aget_state(config)

if __name__ == "__main__":
    asyncio.run(main())
