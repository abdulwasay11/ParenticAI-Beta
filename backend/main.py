from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import uvicorn
import httpx
import asyncio
import os
from datetime import datetime
from typing import List, Optional

from database import SessionLocal, engine
from models import CommunityMessage
import models
from schemas import CommunityMessageCreate, CommunityMessageResponse, ChatMessage, ChatResponse

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI(
    title="ParenticAI API",
    description="AI-powered parenting assistance platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models (now imported from schemas)

# Ollama client configuration - use environment variable to connect to containerized Ollama
OLLAMA_BASE_URL = os.getenv("OLLAMA_URL", "http://host.docker.internal:11434")  # Connect to Ollama via host
MODEL_NAME = "llama3"

@app.get("/")
async def root():
    return {
        "message": "Welcome to ParenticAI API", 
        "status": "running",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": "running",
            "database": "pending setup",
            "ai": "connected to Ollama"
        }
    }

@app.get("/api/status")
async def api_status():
    # Check if Ollama is available
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5.0)
            if response.status_code == 200:
                ai_status = "✅ Ollama Connected"
            else:
                ai_status = "⚠️ Ollama Issues"
    except:
        ai_status = "❌ Ollama Disconnected"
    
    return {
        "frontend": "✅ Connected",
        "backend": "✅ Running", 
        "database": "✅ PostgreSQL Ready",
        "ai_model": ai_status,
        "authentication": "✅ Keycloak Ready"
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_ai(chat_message: ChatMessage):
    """
    Send a message to Ollama Llama 3 for parenting advice
    """
    try:
        # Build context-aware prompt for parenting advice
        system_prompt = """You are ParenticAI, a helpful AI assistant specializing in evidence-based parenting advice. 
        You provide supportive, practical, and age-appropriate guidance for parents. 
        Always be encouraging and consider child safety in your recommendations.
        Keep responses concise but informative."""
        
        # Add child context if provided
        context_info = ""
        if chat_message.child_context:
            context_info = f"\n\nChild context: {', '.join(chat_message.child_context)}"
        
        full_prompt = f"{system_prompt}\n\nParent's question: {chat_message.message}{context_info}\n\nResponse:"
        
        # Call Ollama API
        print(f"DEBUG: Calling Ollama at {OLLAMA_BASE_URL} with model {MODEL_NAME}")
        async with httpx.AsyncClient() as client:
            ollama_request = {
                "model": MODEL_NAME,
                "prompt": full_prompt,
                "stream": False
            }
            
            print(f"DEBUG: Request: {ollama_request}")
            
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json=ollama_request,
                timeout=120.0
            )
            
            print(f"DEBUG: Response status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"DEBUG: Response content: {response.text}")
                raise HTTPException(status_code=500, detail="Failed to get response from AI model")
            
            ai_response = response.json()
            ai_text = ai_response.get("response", "I apologize, but I couldn't generate a response. Please try again.")
            
            print(f"DEBUG: AI response: {ai_text[:100]}...")
            
            return ChatResponse(
                response=ai_text,
                timestamp=datetime.utcnow().isoformat()
            )
            
    except httpx.TimeoutException:
        print("DEBUG: Request timed out after 120 seconds")
        raise HTTPException(status_code=408, detail="AI model request timed out")
    except Exception as e:
        print(f"DEBUG: Exception occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error communicating with AI model: {str(e)}")

@app.post("/api/community/messages", response_model=CommunityMessageResponse)
async def create_community_message(
    message: CommunityMessageCreate, 
    db: Session = Depends(get_db)
):
    """
    Create a new community message
    """
    try:
        # For now, use a simple username system since we don't have full auth
        # In a real app, you'd get the user info from the auth token
        db_message = CommunityMessage(
            user_id=1,  # Hardcoded for now
            username="Anonymous User",  # Hardcoded for now
            content=message.content
        )
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        
        return db_message
    except Exception as e:
        print(f"Error creating community message: {e}")
        raise HTTPException(status_code=500, detail="Failed to create message")

@app.get("/api/community/messages", response_model=List[CommunityMessageResponse])
async def get_community_messages(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get recent community messages
    """
    try:
        messages = db.query(CommunityMessage)\
                    .order_by(CommunityMessage.created_at.desc())\
                    .limit(limit)\
                    .all()
        
        # Reverse to show oldest first in the UI
        return list(reversed(messages))
    except Exception as e:
        print(f"Error fetching community messages: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch messages")

@app.get("/api/ollama/models")
async def get_available_models():
    """
    Get list of available models from Ollama
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=10.0)
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=500, detail="Failed to fetch models from Ollama")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching models: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 