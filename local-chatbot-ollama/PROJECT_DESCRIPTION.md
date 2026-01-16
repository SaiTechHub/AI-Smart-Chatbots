# Local Chatbot with Ollama - Tech Stack & Project Flow

## Tech Stack

**Backend Architecture & AI/ML Framework:**
- Developed a RESTful API backend using FastAPI and Python, integrated with LangChain framework for orchestration of AI workflows and conversational AI capabilities. Implemented vector database solutions using FAISS for efficient similarity search and semantic retrieval, leveraging Ollama for local LLM inference and embeddings generation with scikit-learn for cosine similarity calculations to enable intelligent context-aware responses.

**Frontend Development & User Interface:**
- Built a modern, responsive single-page application using React.js with Vite as the build tool, styled with Tailwind CSS for component-based design. Enhanced user experience through Framer Motion for smooth animations and transitions, and integrated React Markdown for rich text rendering of AI-generated responses, creating an intuitive ChatGPT-like conversational interface.

**Data Processing & Memory Management:**
- Implemented RAG (Retrieval Augmented Generation) architecture combining vector embeddings and semantic search for context retrieval. Designed ConversationBufferMemory system using LangChain to maintain contextual conversation history, with intelligent similarity-based memory recall mechanism that selectively incorporates chat history only when relevance threshold is met, ensuring accurate and contextually appropriate responses.

## Project Flow

**Request-Response Cycle & API Communication:**
- Established a client-server architecture where React frontend sends HTTP POST requests to FastAPI backend endpoints through CORS-enabled middleware. The backend processes incoming chat messages, performs semantic search against FAISS vector store to retrieve relevant context documents, and invokes local Ollama LLM models (qwen2:0.5b) with carefully crafted prompts combining retrieved context and optional conversation history for generating intelligent responses.

**RAG Pipeline & Contextual Intelligence:**
- Implemented a multi-stage RAG pipeline where user queries are converted to vector embeddings using Ollama embeddings model (all-minilm:33m), followed by similarity search against pre-indexed knowledge base documents stored in FAISS vector database. The system dynamically determines conversation relevance by computing cosine similarity between current query and previous user messages, selectively including chat history only when similarity exceeds configurable threshold (0.7), ensuring optimal balance between context awareness and response accuracy.

**State Management & User Experience:**
- Designed real-time bidirectional communication flow where React frontend manages local component state for message history, loading indicators, and user input, while sending asynchronous API calls to backend. The backend maintains persistent conversation memory across requests using ConversationBufferMemory, processes RAG retrieval and LLM inference, and returns JSON-formatted responses that are immediately rendered in the UI with markdown formatting, smooth animations, and automatic scrolling, creating a seamless conversational experience.

