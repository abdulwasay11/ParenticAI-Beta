from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional, Dict, Any

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserCreate(UserBase):
    keycloak_id: str

class UserResponse(UserBase):
    id: int
    keycloak_id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Parent schemas
class ParentBase(BaseModel):
    age: Optional[int] = None
    location: Optional[str] = None
    parenting_style: Optional[str] = None
    concerns: Optional[str] = None
    goals: Optional[str] = None
    experience_level: Optional[str] = None
    family_structure: Optional[str] = None

class ParentCreate(ParentBase):
    pass

class ParentResponse(ParentBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Child schemas
class ChildBase(BaseModel):
    name: str
    age: int
    gender: str
    hobbies: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    personality_traits: Optional[List[str]] = []
    special_needs: Optional[str] = None
    school_grade: Optional[str] = None  # Class the child is in
    studies: Optional[List[str]] = []  # List of subjects/courses
    ethnicity: Optional[str] = None
    height_cm: Optional[float] = None  # Height in centimeters
    weight_kg: Optional[float] = None  # Weight in kilograms
    favorite_activities: Optional[List[str]] = []
    challenges: Optional[str] = None
    achievements: Optional[str] = None

class ChildCreate(ChildBase):
    pass

class ChildResponse(ChildBase):
    id: int
    parent_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Chat message schemas
class ChatMessageBase(BaseModel):
    content: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    id: int
    user_id: int
    is_ai_response: bool
    context_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Options for dropdowns (to be used in frontend)
class ChildOptionsResponse(BaseModel):
    hobbies: List[str]
    interests: List[str]
    personality_traits: List[str]
    genders: List[str]
    school_grades: List[str]

# Predefined options
CHILD_OPTIONS = ChildOptionsResponse(
    hobbies=[
        "Reading", "Drawing", "Painting", "Sports", "Soccer", "Basketball", 
        "Swimming", "Dancing", "Singing", "Playing instruments", "Video games",
        "Board games", "Cooking", "Gardening", "Photography", "Writing",
        "Crafts", "Building with blocks/Lego", "Collecting", "Outdoor activities"
    ],
    interests=[
        "Animals", "Science", "Technology", "Art", "Music", "Sports", 
        "Nature", "Space", "Dinosaurs", "Cars", "Trains", "Airplanes",
        "Cooking", "Fashion", "History", "Geography", "Languages", 
        "Mathematics", "Literature", "Movies", "Cartoons"
    ],
    personality_traits=[
        "Outgoing", "Shy", "Creative", "Analytical", "Energetic", "Calm",
        "Curious", "Independent", "Social", "Introverted", "Adventurous",
        "Cautious", "Empathetic", "Competitive", "Cooperative", "Leadership",
        "Artistic", "Logical", "Emotional", "Practical"
    ],
    genders=["Male", "Female", "Other", "Prefer not to say"],
    school_grades=[
        "Pre-K", "Kindergarten", "1st Grade", "2nd Grade", "3rd Grade",
        "4th Grade", "5th Grade", "6th Grade", "7th Grade", "8th Grade",
        "9th Grade", "10th Grade", "11th Grade", "12th Grade", "College",
        "Not in school"
    ]
)

# Community Message schemas
class CommunityMessageCreate(BaseModel):
    content: str

class CommunityMessageResponse(BaseModel):
    id: int
    user_id: int
    username: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Chat schemas for main.py
class ChatMessage(BaseModel):
    message: str
    child_context: Optional[List[str]] = []

class ChatResponse(BaseModel):
    response: str
    timestamp: str 