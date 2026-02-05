"""Database models for the AI Chatbot Todo application."""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class User(SQLModel, table=True):
    """User model for authentication and data isolation."""

    id: int = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)


class Task(SQLModel, table=True):
    """Task model representing individual todo items."""

    id: int = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM)
    status: TaskStatus = Field(default=TaskStatus.TODO)
    due_date: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Foreign key relationship
    user_id: int = Field(foreign_key="user.id")
    user: User = Relationship(back_populates="tasks")


class Conversation(SQLModel, table=True):
    """Conversation model to group related messages."""

    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str = Field(max_length=200)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user: User = Relationship(back_populates="conversations")
    messages: List["Message"] = Relationship(back_populates="conversation")


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Message(SQLModel, table=True):
    """Message model for storing conversation history."""

    id: int = Field(default=None, primary_key=True)
    role: MessageRole
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Foreign key relationships
    conversation_id: int = Field(foreign_key="conversation.id")
    user_id: int = Field(foreign_key="user.id")

    conversation: Conversation = Relationship(back_populates="messages")
    user: User = Relationship()


# Relationship back-populates
User.model_rebuild()
Conversation.model_rebuild()