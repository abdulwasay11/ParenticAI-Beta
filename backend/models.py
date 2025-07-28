from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    keycloak_id = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    parent_profile = relationship("Parent", back_populates="user", uselist=False)
    chat_messages = relationship("ChatMessage", back_populates="user")

class Parent(Base):
    __tablename__ = "parents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    age = Column(Integer)
    location = Column(String)
    parenting_style = Column(String)
    concerns = Column(Text)
    goals = Column(Text)
    experience_level = Column(String)  # "new", "experienced", "veteran"
    family_structure = Column(String)  # "single", "married", "divorced", etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="parent_profile")
    children = relationship("Child", back_populates="parent")

class Child(Base):
    __tablename__ = "children"
    
    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("parents.id"))
    name = Column(String)
    age = Column(Integer)
    gender = Column(String)
    hobbies = Column(JSON)  # List of hobbies
    interests = Column(JSON)  # List of interests
    personality_traits = Column(JSON)  # List of personality traits
    special_needs = Column(Text)
    school_grade = Column(String)  # Class the child is in
    studies = Column(JSON)  # List of subjects/courses
    ethnicity = Column(String)
    height_cm = Column(Float)  # Height in centimeters
    weight_kg = Column(Float)  # Weight in kilograms
    favorite_activities = Column(JSON)
    challenges = Column(Text)
    achievements = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    parent = relationship("Parent", back_populates="children")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    is_ai_response = Column(Boolean, default=False)
    context_data = Column(JSON)  # Additional context used for the response
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="chat_messages")

class CommunityMessage(Base):
    __tablename__ = "community_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    username = Column(String)  # Store username for display
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User") 