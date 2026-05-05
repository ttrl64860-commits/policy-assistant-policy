from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from groq import Groq
from openai import OpenAI

from database import Base, engine, get_db
from models import User, UserRole
from schemas import UserCreate, UserLogin, TokenResponse, UserResponse
from auth import (
    hash_password,
    create_access_token,
    authenticate_user,
    role_required,
    get_current_user,
)

import faiss
import numpy as np
import uvicorn
import os
import pickle
import requests
import traceback


load_dotenv()

app = FastAPI(title="Explainable Policy Decision Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

FAISS_INDEX_FILE = os.path.join(BASE_DIR, "faiss_index.bin")
CHUNKS_FILE = os.path.join(BASE_DIR, "chunks.pkl")
PDF_TEXT_FILE = os.path.join(BASE_DIR, "pdf_text.pkl")

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq").lower()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "180"))

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

chunks = []
index = None
pdf_text = ""


class QuestionRequest(BaseModel):
    question: str
    provider: str | None = None


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50):
    text = text.strip()

    if not text:
        return []

    if chunk_size <= overlap:
        raise ValueError("chunk_size must be greater than overlap")

    result = []
    step = chunk_size - overlap

    for i in range(0, len(text), step):
        chunk = text[i:i + chunk_size].strip()
        if chunk:
            result.append(chunk)

    return result


def generate_suggestions(text: str):
    default_questions = [
        "What is the leave policy?",
        "What is the attendance policy?",
        "What is the dress code policy?",
        "What is the notice period?",
    ]

    if not text or not text.strip():
        return default_questions

    text_lower = text.lower()
    questions = []

    keyword_map = [
        ("leave", "What is the leave policy?"),
        ("attendance", "What is the attendance policy?"),
        ("dress code", "What is the dress code policy?"),
        ("overtime", "What is the overtime policy?"),
        ("notice period", "What is the notice period?"),
        ("work from home", "Is work from home allowed?"),
        ("wfh", "Is work from home allowed?"),
        ("holiday", "What is the holiday policy?"),
        ("salary", "When is salary credited?"),
        ("late", "What is the late coming policy?"),
        ("probation", "What is the probation period?"),
        ("termination", "What is the termination policy?"),
    ]

    for keyword, question in keyword_map:
        if keyword in text_lower and question not in questions:
            questions.append(question)

    for question in default_questions:
        if question not in questions:
            questions.append(question)

    return questions[:4]


def save_index_and_chunks():
    global index, chunks, pdf_text

    if index is not None:
        faiss.write_index(index, FAISS_INDEX_FILE)

    with open(CHUNKS_FILE, "wb") as f:
        pickle.dump(chunks, f)

    with open(PDF_TEXT_FILE, "wb") as f:
        pickle.dump(pdf_text, f)

    print("✅ Saved FAISS index, chunks, and PDF text")


def load_index_and_chunks():
    global index, chunks, pdf_text

    try:
        if os.path.exists(FAISS_INDEX_FILE) and os.path.exists(CHUNKS_FILE):
            index = faiss.read_index(FAISS_INDEX_FILE)

            with open(CHUNKS_FILE, "rb") as f:
                chunks = pickle.load(f)

            if os.path.exists(PDF_TEXT_FILE):
                with open(PDF_TEXT_FILE, "rb") as f:
                    pdf_text = pickle.load(f)
            else:
                pdf_text = ""

            print("✅ Saved FAISS data loaded")
        else:
            index = None
            chunks = []
            pdf_text = ""
            print("ℹ️ No saved PDF found. Upload PDF first.")

    except Exception:
        index = None
        chunks = []
        pdf_text = ""
        traceback.print_exc()


def check_ollama_connection():
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=10)
        response.raise_for_status()
        return True
    except Exception:
        return False


def build_messages(question: str, context: str):
    system_prompt = """
You are an HR Policy Assistant.

Rules:
1. Answer using ONLY the provided context.
2. Do not mention "based on the document" or "according to the context".
3. Keep the answer short and professional.
4. Answer in 2 to 4 sentences.
5. If the answer is not available, say exactly:
The document does not contain enough information about this.
"""

    user_prompt = f"""
Context:
{context}

Question:
{question}
"""

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]


def ask_ollama(question: str, context: str):
    response = requests.post(
        f"{OLLAMA_BASE_URL}/api/chat",
        json={
            "model": OLLAMA_MODEL,
            "messages": build_messages(question, context),
            "stream": False,
            "options": {
                "temperature": 0.2,
                "num_predict": 300,
            },
            "keep_alive": "10m",
        },
        timeout=OLLAMA_TIMEOUT,
    )

    response.raise_for_status()
    result = response.json()

    answer = result.get("message", {}).get("content", "").strip()

    if not answer:
        return "The document does not contain enough information about this."

    return answer


def ask_groq(question: str, context: str):
    if not GROQ_API_KEY:
        raise Exception("GROQ_API_KEY missing in .env")

    client = Groq(api_key=GROQ_API_KEY)

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=build_messages(question, context),
        temperature=0.2,
        max_tokens=300,
    )

    answer = response.choices[0].message.content.strip()

    if not answer:
        return "The document does not contain enough information about this."

    return answer


def ask_openai(question: str, context: str):
    if not OPENAI_API_KEY:
        raise Exception("OPENAI_API_KEY missing in .env")

    client = OpenAI(api_key=OPENAI_API_KEY)

    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=build_messages(question, context),
        temperature=0.2,
        max_tokens=300,
    )

    answer = response.choices[0].message.content.strip()

    if not answer:
        return "The document does not contain enough information about this."

    return answer


def ask_llm_with_fallback(question: str, context: str, provider: str):
    provider = (provider or LLM_PROVIDER).lower()

    if provider == "groq":
        try:
            answer = ask_groq(question, context)
            return answer, "groq"
        except Exception as e:
            print("⚠️ Groq failed:", str(e))
            print("🔁 Falling back to Ollama...")
            answer = ask_ollama(question, context)
            return answer, "ollama"

    if provider == "openai":
        try:
            answer = ask_openai(question, context)
            return answer, "openai"
        except Exception as e:
            print("⚠️ OpenAI failed:", str(e))
            print("🔁 Falling back to Ollama...")
            answer = ask_ollama(question, context)
            return answer, "ollama"

    if provider == "ollama":
        answer = ask_ollama(question, context)
        return answer, "ollama"

    raise HTTPException(
        status_code=400,
        detail="Invalid provider. Use ollama, groq, or openai.",
    )


@app.on_event("startup")
def startup_event():
    load_index_and_chunks()


@app.get("/")
def home():
    return {
        "message": "Policy AI + RBAC API running successfully",
        "llm_provider": LLM_PROVIDER,
        "ollama_connected": check_ollama_connection(),
        "ollama_model": OLLAMA_MODEL,
        "groq_model": GROQ_MODEL,
        "openai_model": OPENAI_MODEL,
    }


@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    role = user.role.upper()

    if role not in ["HR", "MANAGER", "EMPLOYEE"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role=UserRole(role),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.post("/login", response_model=TokenResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = authenticate_user(db, user.email, user.password)

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        data={
            "sub": db_user.email,
            "role": db_user.role.value,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": db_user.role.value,
        "name": db_user.name,
        "email": db_user.email,
    }


@app.get("/profile")
def profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role.value,
    }


@app.get("/employee/dashboard")
def employee_dashboard(current_user: User = Depends(role_required(["EMPLOYEE"]))):
    return {
        "message": f"Welcome Employee {current_user.name}",
        "data": "Employee can submit requests and view own status",
    }


@app.get("/hr/dashboard")
def hr_dashboard(current_user: User = Depends(role_required(["HR"]))):
    return {
        "message": f"Welcome HR {current_user.name}",
        "data": "HR can review employee requests and manage records",
    }


@app.get("/manager/dashboard")
def manager_dashboard(current_user: User = Depends(role_required(["MANAGER"]))):
    return {
        "message": f"Welcome Manager {current_user.name}",
        "data": "Manager can approve or reject requests and view reports",
    }


@app.get("/common/dashboard")
def common_dashboard(
    current_user: User = Depends(role_required(["HR", "MANAGER", "EMPLOYEE"]))
):
    return {
        "message": f"Welcome {current_user.name}",
        "role": current_user.role.value,
    }


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global chunks, index, pdf_text

    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="File name missing")

        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files allowed")

        reader = PdfReader(file.file)
        text = ""

        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"

        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="Empty PDF or no readable text found",
            )

        pdf_text = text
        chunks = chunk_text(pdf_text)

        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="Could not create chunks from PDF",
            )

        embeddings = embedding_model.encode(chunks)
        embeddings = np.array(embeddings, dtype="float32")

        if embeddings.ndim != 2 or embeddings.shape[0] == 0:
            raise HTTPException(
                status_code=500,
                detail="Failed to create embeddings",
            )

        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings)

        save_index_and_chunks()

        return {
            "message": "PDF uploaded and indexed successfully",
            "filename": file.filename,
            "total_chunks": len(chunks),
            "questions": generate_suggestions(pdf_text),
        }

    except HTTPException:
        raise

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/suggestions")
def suggestions():
    return {
        "questions": generate_suggestions(pdf_text),
    }


@app.post("/ask")
async def ask_question(data: QuestionRequest):
    global chunks, index

    try:
        if index is None or not chunks:
            raise HTTPException(status_code=400, detail="Upload PDF first")

        question = data.question.strip()

        if not question:
            raise HTTPException(status_code=400, detail="Question is required")

        provider = data.provider or LLM_PROVIDER
        provider = provider.lower()

        print("👉 Requested provider:", provider)

        query_vec = embedding_model.encode([question])
        query_vec = np.array(query_vec, dtype="float32")

        if query_vec.ndim != 2 or query_vec.shape[0] == 0:
            raise HTTPException(
                status_code=500,
                detail="Failed to create query embedding",
            )

        k = min(4, len(chunks))
        distances, indices = index.search(query_vec, k=k)

        retrieved_chunks = []

        for i in indices[0]:
            if 0 <= i < len(chunks):
                retrieved_chunks.append(chunks[i])

        if not retrieved_chunks:
            return {
                "question": question,
                "response": "The document does not contain enough information about this.",
                "retrieved_context": [],
                "llm_provider": provider,
            }

        context = "\n\n".join(retrieved_chunks)

        answer, used_provider = ask_llm_with_fallback(question, context, provider)

        return {
            "question": question,
            "response": answer,
            "retrieved_context": retrieved_chunks,
            "llm_provider": used_provider,
        }

    except HTTPException:
        raise

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Ask failed: {str(e)}")


@app.get("/status")
def status_check():
    return {
        "pdf_loaded": index is not None and len(chunks) > 0,
        "total_chunks": len(chunks),
        "has_pdf_text": bool(pdf_text.strip()),
        "suggestions": generate_suggestions(pdf_text),
        "llm_provider": LLM_PROVIDER,
        "ollama_connected": check_ollama_connection(),
        "ollama_model": OLLAMA_MODEL,
        "groq_model": GROQ_MODEL,
        "openai_model": OPENAI_MODEL,
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )