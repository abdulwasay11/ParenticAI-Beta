import httpx
import json
import os
from typing import List, Optional
from models import Parent, Child

class AIService:
    def __init__(self):
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.model_name = "llama3"
        
    async def _ensure_model_available(self):
        """Ensure Llama 3 model is pulled and available"""
        try:
            async with httpx.AsyncClient() as client:
                # Check if model is available
                response = await client.get(f"{self.ollama_url}/api/tags")
                if response.status_code == 200:
                    models = response.json()
                    model_names = [model["name"] for model in models.get("models", [])]
                    
                    if self.model_name not in model_names:
                        # Pull the model if not available
                        pull_response = await client.post(
                            f"{self.ollama_url}/api/pull",
                            json={"name": self.model_name}
                        )
                        if pull_response.status_code != 200:
                            raise Exception(f"Failed to pull model: {pull_response.text}")
                        
        except Exception as e:
            print(f"Warning: Could not ensure model availability: {e}")

    def _build_context(self, parent: Optional[Parent], children: List[Child]) -> str:
        """Build context string from parent and children data"""
        context_parts = []
        
        if parent:
            context_parts.append(f"Parent Information:")
            context_parts.append(f"- Age: {parent.age or 'Not specified'}")
            context_parts.append(f"- Location: {parent.location or 'Not specified'}")
            context_parts.append(f"- Parenting Style: {parent.parenting_style or 'Not specified'}")
            context_parts.append(f"- Experience Level: {parent.experience_level or 'Not specified'}")
            context_parts.append(f"- Family Structure: {parent.family_structure or 'Not specified'}")
            
            if parent.concerns:
                context_parts.append(f"- Main Concerns: {parent.concerns}")
            if parent.goals:
                context_parts.append(f"- Parenting Goals: {parent.goals}")
        
        if children:
            context_parts.append(f"\nChildren Information:")
            for i, child in enumerate(children, 1):
                context_parts.append(f"Child {i}: {child.name}")
                context_parts.append(f"- Age: {child.age}")
                context_parts.append(f"- Gender: {child.gender}")
                context_parts.append(f"- School Grade: {child.school_grade or 'Not specified'}")
                
                if child.hobbies:
                    context_parts.append(f"- Hobbies: {', '.join(child.hobbies)}")
                if child.interests:
                    context_parts.append(f"- Interests: {', '.join(child.interests)}")
                if child.personality_traits:
                    context_parts.append(f"- Personality Traits: {', '.join(child.personality_traits)}")
                if child.special_needs:
                    context_parts.append(f"- Special Needs: {child.special_needs}")
                if child.challenges:
                    context_parts.append(f"- Current Challenges: {child.challenges}")
                if child.achievements:
                    context_parts.append(f"- Recent Achievements: {child.achievements}")
                
                context_parts.append("")  # Empty line between children
        
        return "\n".join(context_parts)

    async def generate_response(
        self, 
        user_message: str, 
        parent: Optional[Parent] = None, 
        children: List[Child] = None
    ) -> str:
        """Generate AI response using Llama 3"""
        try:
            await self._ensure_model_available()
            
            # Build context from parent and children data
            context = self._build_context(parent, children or [])
            
            # Create system prompt
            system_prompt = """You are ParenticAI, a helpful and empathetic AI assistant specialized in parenting advice and support. 

Your role is to:
- Provide evidence-based parenting guidance and tips
- Offer emotional support and understanding
- Suggest age-appropriate activities and solutions
- Help with child development questions
- Provide gentle, non-judgmental advice
- Consider individual family circumstances and children's personalities

Always be:
- Supportive and encouraging
- Practical and actionable in your advice
- Sensitive to different parenting styles and family structures
- Clear that you're an AI assistant and parents should consult professionals for serious concerns

If no specific child or family context is provided, give general parenting advice that can be adapted to different situations."""

            # Build the full prompt
            if context.strip():
                full_prompt = f"{system_prompt}\n\nFamily Context:\n{context}\n\nParent's Question: {user_message}\n\nResponse:"
            else:
                full_prompt = f"{system_prompt}\n\nParent's Question: {user_message}\n\nResponse:"

            # Call Ollama API
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": self.model_name,
                        "prompt": full_prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.7,
                            "top_p": 0.9,
                            "max_tokens": 1000
                        }
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("response", "I apologize, but I couldn't generate a response at this time.")
                else:
                    print(f"Ollama API error: {response.status_code} - {response.text}")
                    return "I'm currently experiencing technical difficulties. Please try again in a moment."
                    
        except Exception as e:
            print(f"AI Service error: {e}")
            return "I apologize, but I'm currently unable to process your request. Please try again later."

    async def test_connection(self) -> bool:
        """Test connection to Ollama service"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.ollama_url}/api/tags")
                return response.status_code == 200
        except:
            return False 