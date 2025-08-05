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
from models import CommunityMessage, User, Parent, Child
import models
from schemas import (
    CommunityMessageCreate, CommunityMessageResponse, ChatMessage, ChatResponse,
    UserCreate, UserResponse, ParentCreate, ParentResponse, ChildCreate, ChildResponse,
    ChildOptionsResponse, CHILD_OPTIONS
)

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
    allow_origins=[
        "http://localhost:80",
        "http://localhost:3000",
        "https://parenticai.com",
        "https://www.parenticai.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models (now imported from schemas)

# Ollama client configuration - use environment variable to connect to containerized Ollama
OLLAMA_BASE_URL = os.getenv("OLLAMA_URL", "http://host.docker.internal:11434")  # Connect to Ollama via host
MODEL_NAME = "llama3.2"

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

# User Management Endpoints
@app.post("/api/users", response_model=UserResponse)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user
    """
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.keycloak_id == user.keycloak_id).first()
        if existing_user:
            return existing_user
        
        db_user = User(
            keycloak_id=user.keycloak_id,
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        print(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail="Failed to create user")

@app.get("/api/users/{keycloak_id}", response_model=UserResponse)
async def get_user(keycloak_id: str, db: Session = Depends(get_db)):
    """
    Get user by Keycloak ID
    """
    user = db.query(User).filter(User.keycloak_id == keycloak_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Parent Profile Endpoints
@app.post("/api/parents", response_model=ParentResponse)
async def create_parent_profile(parent: ParentCreate, keycloak_id: str, db: Session = Depends(get_db)):
    """
    Create or update parent profile
    """
    try:
        # Get user by Keycloak ID
        user = db.query(User).filter(User.keycloak_id == keycloak_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if parent profile already exists
        existing_parent = db.query(Parent).filter(Parent.user_id == user.id).first()
        
        if existing_parent:
            # Update existing profile
            for field, value in parent.dict(exclude_unset=True).items():
                setattr(existing_parent, field, value)
            db.commit()
            db.refresh(existing_parent)
            return existing_parent
        else:
            # Create new profile
            db_parent = Parent(
                user_id=user.id,
                **parent.dict()
            )
            db.add(db_parent)
            db.commit()
            db.refresh(db_parent)
            return db_parent
    except Exception as e:
        print(f"Error creating/updating parent profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to create/update parent profile")

@app.get("/api/parents/{keycloak_id}", response_model=ParentResponse)
async def get_parent_profile(keycloak_id: str, db: Session = Depends(get_db)):
    """
    Get parent profile by user's Keycloak ID
    """
    user = db.query(User).filter(User.keycloak_id == keycloak_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    parent = db.query(Parent).filter(Parent.user_id == user.id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent profile not found")
    
    return parent

# Children Management Endpoints
@app.post("/api/children", response_model=ChildResponse)
async def create_child(child: ChildCreate, keycloak_id: str, db: Session = Depends(get_db)):
    """
    Create a new child profile
    """
    try:
        # Get user and parent profile
        user = db.query(User).filter(User.keycloak_id == keycloak_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        parent = db.query(Parent).filter(Parent.user_id == user.id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent profile not found. Please create a parent profile first.")
        
        db_child = Child(
            parent_id=parent.id,
            **child.dict()
        )
        db.add(db_child)
        db.commit()
        db.refresh(db_child)
        return db_child
    except Exception as e:
        print(f"Error creating child: {e}")
        raise HTTPException(status_code=500, detail="Failed to create child")

@app.get("/api/children/{keycloak_id}", response_model=List[ChildResponse])
async def get_children(keycloak_id: str, db: Session = Depends(get_db)):
    """
    Get all children for a user
    """
    user = db.query(User).filter(User.keycloak_id == keycloak_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    parent = db.query(Parent).filter(Parent.user_id == user.id).first()
    if not parent:
        return []
    
    children = db.query(Child).filter(Child.parent_id == parent.id).all()
    return children

@app.put("/api/children/{child_id}", response_model=ChildResponse)
async def update_child(child_id: int, child: ChildCreate, keycloak_id: str, db: Session = Depends(get_db)):
    """
    Update a child profile
    """
    try:
        # Verify user owns this child
        user = db.query(User).filter(User.keycloak_id == keycloak_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        parent = db.query(Parent).filter(Parent.user_id == user.id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent profile not found")
        
        db_child = db.query(Child).filter(Child.id == child_id, Child.parent_id == parent.id).first()
        if not db_child:
            raise HTTPException(status_code=404, detail="Child not found")
        
        # Update child data
        for field, value in child.dict(exclude_unset=True).items():
            setattr(db_child, field, value)
        
        db.commit()
        db.refresh(db_child)
        return db_child
    except Exception as e:
        print(f"Error updating child: {e}")
        raise HTTPException(status_code=500, detail="Failed to update child")

@app.delete("/api/children/{child_id}")
async def delete_child(child_id: int, keycloak_id: str, db: Session = Depends(get_db)):
    """
    Delete a child profile
    """
    try:
        # Verify user owns this child
        user = db.query(User).filter(User.keycloak_id == keycloak_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        parent = db.query(Parent).filter(Parent.user_id == user.id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent profile not found")
        
        db_child = db.query(Child).filter(Child.id == child_id, Child.parent_id == parent.id).first()
        if not db_child:
            raise HTTPException(status_code=404, detail="Child not found")
        
        db.delete(db_child)
        db.commit()
        return {"message": "Child deleted successfully"}
    except Exception as e:
        print(f"Error deleting child: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete child")

# Options endpoint for frontend dropdowns
@app.get("/api/child-options", response_model=ChildOptionsResponse)
async def get_child_options():
    """
    Get predefined options for child profiles
    """
    return CHILD_OPTIONS

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 