'''
install ollama : https://ollama.com/download
make sure you have the ollama daemon running: ollama serve
pull ollama models:
    ollama pull qwen2:0.5b
    ollama pull all-minilm:33m
'''

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from langchain_community.llms import Ollama
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from langchain.schema import HumanMessage, AIMessage
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

SIMILARITY_THRESHOLD = 0.7   # tune between 0.65 – 0.8
MAX_TURNS = 2

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Models ----------
llm = Ollama(
    model="qwen2:0.5b",
    num_predict=128,
    temperature=0.2,
    top_p=0.9,
    timeout=5,
)

embeddings = OllamaEmbeddings(model="all-minilm:33m")

# ---------- FAISS Vector Store (NO telemetry) ----------
documents = [
    "FastAPI is a high-performance Python web framework for APIs.",
    "Ollama allows running LLMs locally on your machine.",
    "FAISS is a vector similarity search library by Facebook."
]

vectorstore = FAISS.from_texts(
    documents,
    embedding=embeddings
)

# ---------- Memory ----------
memory = ConversationBufferMemory(return_messages=True)

# ---------- Request ----------
class ChatRequest(BaseModel):
    message: str

# ---------- SYNC API ----------
@app.post("/chat")
def chat(request: ChatRequest):
    message = request.message.strip()
    if not message:
        return {"reply": "Message cannot be empty."}

    # ---- RAG retrieval ----
    docs = vectorstore.similarity_search(message, k=2)
    context = "\n".join(d.page_content for d in docs)

    # ---- Decide whether to use memory ----
    chat_history = ""

    recent_messages = memory.chat_memory.messages[-MAX_TURNS * 2:]

    if recent_messages:
        # Take last user question from memory
        last_user_msg = next(
            (m.content for m in reversed(recent_messages) if isinstance(m, HumanMessage)),
            None
        )

        if last_user_msg:
            # ---- Embedding similarity check ----
            q_embed = embeddings.embed_query(message)
            last_embed = embeddings.embed_query(last_user_msg)

            similarity = cosine_similarity(
                [q_embed],
                [last_embed]
            )[0][0]

            if similarity >= SIMILARITY_THRESHOLD:
                # ✅ Only then include memory
                for msg in recent_messages:
                    if isinstance(msg, HumanMessage):
                        chat_history += f"User: {msg.content}\n"
                    elif isinstance(msg, AIMessage):
                        chat_history += f"AI: {msg.content}\n"

    # ---- Prompt ----
    prompt = f"""
Answer clearly and accurately.
Use previous conversation ONLY if relevant.

Context:
{context}

Conversation (if relevant):
{chat_history}

Question:
{message}

Answer:
"""

    response = llm.invoke(prompt)

    # ---- Save memory (always save, but selectively recall later) ----
    memory.save_context(
        {"input": message},
        {"output": response}
    )

    return {"reply": response}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
