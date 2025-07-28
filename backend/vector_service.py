import chromadb
import os
import json
from typing import List, Dict, Any, Optional
from models import Child, ChatMessage
from datetime import datetime

class VectorService:
    def __init__(self):
        self.chroma_url = os.getenv("CHROMA_URL", "http://localhost:8000")
        self.client = chromadb.HttpClient(host=self.chroma_url.replace("http://", "").split(":")[0], 
                                        port=int(self.chroma_url.split(":")[-1]))
        
        # Initialize collections
        self._init_collections()
    
    def _init_collections(self):
        """Initialize Chroma collections"""
        try:
            # Collection for child data
            self.children_collection = self.client.get_or_create_collection(
                name="children_data",
                metadata={"description": "Child profiles and information"}
            )
            
            # Collection for chat messages
            self.chat_collection = self.client.get_or_create_collection(
                name="chat_history",
                metadata={"description": "User chat messages and AI responses"}
            )
            
        except Exception as e:
            print(f"Warning: Could not initialize Chroma collections: {e}")
    
    async def store_child_data(self, child: Child):
        """Store child data in vector database"""
        try:
            # Create a comprehensive text representation of the child
            child_text = self._create_child_text(child)
            
            # Metadata for filtering and retrieval
            metadata = {
                "child_id": child.id,
                "parent_id": child.parent_id,
                "name": child.name,
                "age": child.age,
                "gender": child.gender,
                "school_grade": child.school_grade or "",
                "created_at": child.created_at.isoformat() if child.created_at else datetime.utcnow().isoformat(),
                "type": "child_profile"
            }
            
            # Store in Chroma
            self.children_collection.add(
                documents=[child_text],
                ids=[f"child_{child.id}"],
                metadatas=[metadata]
            )
            
            print(f"Stored child data for {child.name} (ID: {child.id})")
            
        except Exception as e:
            print(f"Error storing child data: {e}")
    
    async def update_child_data(self, child: Child):
        """Update child data in vector database"""
        try:
            # Delete existing entry
            try:
                self.children_collection.delete(ids=[f"child_{child.id}"])
            except:
                pass  # Entry might not exist
            
            # Add updated entry
            await self.store_child_data(child)
            
        except Exception as e:
            print(f"Error updating child data: {e}")
    
    def _create_child_text(self, child: Child) -> str:
        """Create a comprehensive text representation of the child"""
        text_parts = [
            f"Child Name: {child.name}",
            f"Age: {child.age} years old",
            f"Gender: {child.gender}",
        ]
        
        if child.school_grade:
            text_parts.append(f"School Grade: {child.school_grade}")
        
        if child.hobbies:
            text_parts.append(f"Hobbies: {', '.join(child.hobbies)}")
        
        if child.interests:
            text_parts.append(f"Interests: {', '.join(child.interests)}")
        
        if child.personality_traits:
            text_parts.append(f"Personality Traits: {', '.join(child.personality_traits)}")
        
        if child.favorite_activities:
            text_parts.append(f"Favorite Activities: {', '.join(child.favorite_activities)}")
        
        if child.special_needs:
            text_parts.append(f"Special Needs: {child.special_needs}")
        
        if child.challenges:
            text_parts.append(f"Current Challenges: {child.challenges}")
        
        if child.achievements:
            text_parts.append(f"Recent Achievements: {child.achievements}")
        
        return "\n".join(text_parts)
    
    async def store_chat_message(self, message: ChatMessage):
        """Store chat message in vector database"""
        try:
            message_text = message.content
            
            metadata = {
                "message_id": message.id,
                "user_id": message.user_id,
                "is_ai_response": message.is_ai_response,
                "created_at": message.created_at.isoformat() if message.created_at else datetime.utcnow().isoformat(),
                "type": "ai_response" if message.is_ai_response else "user_message"
            }
            
            # Add context data if available
            if message.context_data:
                metadata.update({
                    "has_context": True,
                    "context_keys": list(message.context_data.keys())
                })
            
            # Store in Chroma
            self.chat_collection.add(
                documents=[message_text],
                ids=[f"message_{message.id}"],
                metadatas=[metadata]
            )
            
        except Exception as e:
            print(f"Error storing chat message: {e}")
    
    async def search_child_data(self, query: str, parent_id: int, limit: int = 5) -> List[Dict[str, Any]]:
        """Search child data for relevant information"""
        try:
            results = self.children_collection.query(
                query_texts=[query],
                n_results=limit,
                where={"parent_id": parent_id}
            )
            
            return self._format_search_results(results)
            
        except Exception as e:
            print(f"Error searching child data: {e}")
            return []
    
    async def search_chat_history(self, query: str, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """Search chat history for relevant conversations"""
        try:
            results = self.chat_collection.query(
                query_texts=[query],
                n_results=limit,
                where={"user_id": user_id}
            )
            
            return self._format_search_results(results)
            
        except Exception as e:
            print(f"Error searching chat history: {e}")
            return []
    
    def _format_search_results(self, results) -> List[Dict[str, Any]]:
        """Format Chroma search results"""
        formatted_results = []
        
        if not results or not results['documents']:
            return formatted_results
        
        for i, doc in enumerate(results['documents'][0]):
            result = {
                "document": doc,
                "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                "distance": results['distances'][0][i] if results['distances'] else None
            }
            formatted_results.append(result)
        
        return formatted_results
    
    async def get_chat_context(self, user_id: int, limit: int = 5) -> List[Dict[str, Any]]:
        """Get recent chat context for better AI responses"""
        try:
            results = self.chat_collection.query(
                query_texts=["recent conversation context"],
                n_results=limit,
                where={"user_id": user_id}
            )
            
            return self._format_search_results(results)
            
        except Exception as e:
            print(f"Error getting chat context: {e}")
            return []
    
    async def delete_child_data(self, child_id: int):
        """Delete child data from vector database"""
        try:
            self.children_collection.delete(ids=[f"child_{child_id}"])
        except Exception as e:
            print(f"Error deleting child data: {e}")
    
    async def delete_user_chat_history(self, user_id: int):
        """Delete all chat history for a user"""
        try:
            # Get all messages for the user
            results = self.chat_collection.get(
                where={"user_id": user_id}
            )
            
            if results and results['ids']:
                self.chat_collection.delete(ids=results['ids'])
                
        except Exception as e:
            print(f"Error deleting user chat history: {e}")
    
    async def test_connection(self) -> bool:
        """Test connection to Chroma service"""
        try:
            self.client.heartbeat()
            return True
        except:
            return False 