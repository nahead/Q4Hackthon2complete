"""Stateless chat API endpoint for the AI Chatbot Todo application.

This endpoint follows the stateless server rule and loads conversation history
from the database on every request.
"""
# Last updated: 2026-02-02 to fix agent initialization issue

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..models import User, Task, Conversation, Message, MessageRole, TaskStatus, TaskPriority
from ..database import SessionLocal
from ..config import config
from typing import List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
import logging
import jwt
from jose import JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Import MCP service
from ..services.mcp_service import mcp_task_service

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

# Security scheme for JWT
security = HTTPBearer()

class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    message: str
    # Removed user_id as it should be derived from JWT


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    response: str
    conversation_id: int
    timestamp: datetime

# Dependency to get database session
def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get current user from JWT token
def get_current_user_from_jwt(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db_session)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, config.get_secret_key(), algorithms=[config.get_algorithm()])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()

    if user is None:
        raise credentials_exception

    return user

async def get_conversation_history(db: Session, user_id: int, conversation_id: int) -> List[Dict[str, str]]:
    """Load conversation history from database."""
    # Get the conversation
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Verify user owns the conversation
    if conversation.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Get all messages in the conversation ordered by timestamp
    messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.timestamp).all()

    # Convert messages to dictionary format
    history = []
    for message in messages:
        history.append({
            "role": message.role.value,
            "content": message.content,
            "timestamp": message.timestamp.isoformat()
        })

    return history


async def create_conversation_if_not_exists(db: Session, user_id: int, title: str = "Default Chat") -> int:
    """Create a new conversation if one doesn't exist."""
    # Check if user already has a default conversation
    conversation = db.query(Conversation).filter(Conversation.user_id == user_id).filter(Conversation.title == title).order_by(Conversation.created_at.desc()).first()

    if conversation:
        return conversation.id

    # Create new conversation
    new_conversation = Conversation(
        user_id=user_id,
        title=title,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)

    return new_conversation.id


async def save_message(db: Session, conversation_id: int, user_id: int, role: MessageRole, content: str):
    """Save a message to the database."""
    message = Message(
        conversation_id=conversation_id,
        user_id=user_id,
        role=role,
        content=content,
        timestamp=datetime.utcnow()
    )
    db.add(message)
    db.commit()


@router.get("/{user_id}/history")
async def get_chat_history(
    user_id: int,  # This is kept for URL compatibility but will be ignored
    current_user: User = Depends(get_current_user_from_jwt),
    db: Session = Depends(get_db_session)
):
    """
    Get conversation history for a user
    """
    try:
        logger.info(f"Getting chat history for user {current_user.id}")

        # Get the latest conversation for the authenticated user (ignore URL user_id)
        conversation = db.query(Conversation).filter(Conversation.user_id == current_user.id).order_by(Conversation.updated_at.desc()).first()

        if not conversation:
            # Create a default conversation if none exists
            conversation = Conversation(
                user_id=current_user.id,
                title=f"Chat {datetime.utcnow().strftime('%Y-%m-%d')}",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)

        # Get all messages in the conversation
        messages = db.query(Message).filter(Message.conversation_id == conversation.id).order_by(Message.timestamp).all()

        # Convert messages to dictionary format
        history = []
        for message in messages:
            history.append({
                "id": message.id,
                "role": message.role.value,
                "content": message.content,
                "timestamp": message.timestamp.isoformat()
            })

        return {
            "conversation_id": conversation.id,
            "messages": history
        }
    except Exception as e:
        logger.error(f"Error getting chat history: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{user_id}", response_model=ChatResponse)
async def chat_endpoint(
    user_id: int,  # This is kept for URL compatibility but will be ignored
    request: ChatRequest,
    current_user: User = Depends(get_current_user_from_jwt),
    db: Session = Depends(get_db_session)
):
    """
    Stateless chat endpoint that:
    1. Loads conversation history from DB
    2. Creates conversation if none exists
    3. Passes history to AI agent
    4. Stores user and assistant messages
    5. Remains completely stateless
    """
    try:
        logger.info(f"Processing chat request for user {current_user.id}")

        # Create or get conversation using JWT-derived user_id (ignore URL user_id)
        conversation_id = await create_conversation_if_not_exists(
            db, current_user.id, f"Chat {datetime.utcnow().strftime('%Y-%m-%d')}"
        )

        # Load conversation history from database using JWT-derived user_id
        conversation_history = await get_conversation_history(db, current_user.id, conversation_id)

        # Save user message to database BEFORE processing using JWT-derived user_id
        await save_message(db, conversation_id, current_user.id, MessageRole.USER, request.message)

        # Process the message with improved intent detection and friendlier responses
        from ..models import Task, TaskStatus, TaskPriority
        import re

        user_msg_lower = request.message.lower().strip()

        # Check for greeting first (before attempting other processing)
        if any(greeting in user_msg_lower for greeting in ["hello", "hi", "hey", "greetings", "morning", "afternoon", "evening", "sup", "yo", "kya", "hal", "hai", "ola", "bonjour", "ciao"]):
            ai_response = "Hey there! 👋 I'm your friendly AI assistant. I can help you manage your tasks - just tell me what you'd like to do! 😊"

        # Check for help intent
        elif any(help_word in user_msg_lower for help_word in ["help", "what can", "how to", "assist", "commands", "options", "features"]):
            ai_response = """I'm here to help! 🤗 Here's what I can do for you:

📝 **Create tasks**: Say "add task to buy groceries" or "create a task to call mom"
📋 **List tasks**: Say "show my tasks" or "what do I have to do?"
✅ **Complete tasks**: Say "mark task #1 as done" or "complete the first task"
🗑️ **Delete tasks**: Say "remove task #2" or "delete the last task"
❓ **Ask anything**: Just chat with me naturally!

Try saying something like: "Create a task to finish homework" or "What are my pending tasks?" """

        # List tasks intent detection - CHECK BEFORE general task word matching
        elif any(word in user_msg_lower for word in ["list", "show", "view", "see", "my", "tasks", "pending", "todo", "to-do"]):
            # Query user's tasks using MCP service
            if any(word in user_msg_lower for word in ["pending", "todo", "to-do", "incomplete"]):
                # Show only pending tasks
                tasks_data = await mcp_task_service.get_tasks_by_user(
                    db,
                    user_id=current_user.id,
                    status="todo"  # pending tasks
                )
                # Convert to Task objects for compatibility
                from sqlalchemy.orm import make_transient
                tasks = []
                for task_data in tasks_data:
                    task = Task(
                        id=task_data["id"],
                        user_id=task_data["user_id"],
                        title=task_data["title"],
                        description=task_data["description"],
                        status=TaskStatus(task_data["status"]),
                        priority=TaskPriority(task_data["priority"]),
                        due_date=datetime.fromisoformat(task_data["due_date"]) if task_data["due_date"] else None,
                        created_at=datetime.fromisoformat(task_data["created_at"]),
                        updated_at=datetime.fromisoformat(task_data["updated_at"])
                    )
                    tasks.append(task)
            elif any(word in user_msg_lower for word in ["completed", "done", "finished"]):
                # Show only completed tasks
                tasks_data = await mcp_task_service.get_tasks_by_user(
                    db,
                    user_id=current_user.id,
                    status="completed"
                )
                # Convert to Task objects for compatibility
                tasks = []
                for task_data in tasks_data:
                    task = Task(
                        id=task_data["id"],
                        user_id=task_data["user_id"],
                        title=task_data["title"],
                        description=task_data["description"],
                        status=TaskStatus(task_data["status"]),
                        priority=TaskPriority(task_data["priority"]),
                        due_date=datetime.fromisoformat(task_data["due_date"]) if task_data["due_date"] else None,
                        created_at=datetime.fromisoformat(task_data["created_at"]),
                        updated_at=datetime.fromisoformat(task_data["updated_at"])
                    )
                    tasks.append(task)
            else:
                # Show all tasks
                tasks_data = await mcp_task_service.get_tasks_by_user(db, user_id=current_user.id)
                # Convert to Task objects for compatibility
                tasks = []
                for task_data in tasks_data:
                    task = Task(
                        id=task_data["id"],
                        user_id=task_data["user_id"],
                        title=task_data["title"],
                        description=task_data["description"],
                        status=TaskStatus(task_data["status"]),
                        priority=TaskPriority(task_data["priority"]),
                        due_date=datetime.fromisoformat(task_data["due_date"]) if task_data["due_date"] else None,
                        created_at=datetime.fromisoformat(task_data["created_at"]),
                        updated_at=datetime.fromisoformat(task_data["updated_at"])
                    )
                    tasks.append(task)

            if not tasks:
                if any(word in user_msg_lower for word in ["pending", "todo", "to-do", "incomplete"]):
                    ai_response = "You don't have any pending tasks right now! 🎉 Would you like to add something new?"
                elif any(word in user_msg_lower for word in ["completed", "done", "finished"]):
                    ai_response = "You don't have any completed tasks yet. Keep working on your todos! 💪"
                else:
                    ai_response = "You don't have any tasks yet! 📝 Would you like to add something new?"

            else:
                # Format task list nicely
                task_list = []
                for i, task in enumerate(tasks[:10]):  # Limit to 10 tasks
                    status_emoji = "✅" if task.status == TaskStatus.COMPLETED else "⏳"
                    task_list.append(f"{status_emoji} {i+1}. **{task.title}**")

                if len(tasks) > 10:
                    task_list.append(f"... and {len(tasks) - 10} more tasks")

                task_summary = "\n".join(task_list)

                if any(word in user_msg_lower for word in ["pending", "todo", "to-do", "incomplete"]):
                    ai_response = f"Here are your pending tasks:\n{task_summary}\n\nKeep up the great work! 💪"
                elif any(word in user_msg_lower for word in ["completed", "done", "finished"]):
                    ai_response = f"Here are your completed tasks:\n{task_summary}\n\nAwesome job finishing these! 🎉"
                else:
                    ai_response = f"Here are your tasks:\n{task_summary}\n\nTotal: {len(tasks)} tasks. You've got this! 💪"

        # Complete/mark done intent detection - CHECK BEFORE general task word matching
        elif any(word in user_msg_lower for word in ["complete", "done", "finish", "mark", "completed", "tick", "check"]):
            # Try to identify specific task to complete
            task_num_match = re.search(r'(?:task|#)\s*(\d+)|(\d+)\s*(?:st|nd|rd|th)\s*(?:task|one|item)|first|last', request.message, re.IGNORECASE)

            task_completed = None
            if task_num_match:
                # Try to complete specific task by number
                num_str = task_num_match.group(1) or task_num_match.group(2)
                if num_str:
                    try:
                        if num_str.lower() in ['first']:
                            # Complete first/oldest pending task using MCP service
                            # First get pending tasks
                            pending_tasks_data = await mcp_task_service.get_tasks_by_user(
                                user_id=current_user.id,
                                status="todo"
                            )
                            if pending_tasks_data:
                                # Take the first (oldest) pending task
                                first_task_data = pending_tasks_data[-1]  # Oldest would be last in desc order
                                task_completed_data = await mcp_task_service.complete_task(
                                    db,
                                    task_id=first_task_data["id"],
                                    user_id=current_user.id
                                )
                                if task_completed_data:
                                    # Convert back to Task object for compatibility
                                    task_completed = Task(
                                        id=task_completed_data["id"],
                                        user_id=task_completed_data["user_id"],
                                        title=task_completed_data["title"],
                                        description=task_completed_data["description"],
                                        status=TaskStatus(task_completed_data["status"]),
                                        priority=TaskPriority(task_completed_data["priority"]),
                                        due_date=datetime.fromisoformat(task_completed_data["due_date"]) if task_completed_data["due_date"] else None,
                                        created_at=datetime.fromisoformat(task_completed_data["created_at"]),
                                        updated_at=datetime.fromisoformat(task_completed_data["updated_at"])
                                    )
                        elif num_str.lower() in ['last']:
                            # Complete last/newest pending task using MCP service
                            pending_tasks_data = await mcp_task_service.get_tasks_by_user(
                                user_id=current_user.id,
                                status="todo"
                            )
                            if pending_tasks_data:
                                # Take the last (newest) pending task
                                last_task_data = pending_tasks_data[0]  # Newest would be first in desc order
                                task_completed_data = await mcp_task_service.complete_task(
                                    db,
                                    task_id=last_task_data["id"],
                                    user_id=current_user.id
                                )
                                if task_completed_data:
                                    # Convert back to Task object for compatibility
                                    task_completed = Task(
                                        id=task_completed_data["id"],
                                        user_id=task_completed_data["user_id"],
                                        title=task_completed_data["title"],
                                        description=task_completed_data["description"],
                                        status=TaskStatus(task_completed_data["status"]),
                                        priority=TaskPriority(task_completed_data["priority"]),
                                        due_date=datetime.fromisoformat(task_completed_data["due_date"]) if task_completed_data["due_date"] else None,
                                        created_at=datetime.fromisoformat(task_completed_data["created_at"]),
                                        updated_at=datetime.fromisoformat(task_completed_data["updated_at"])
                                    )
                        else:
                            # Complete specific numbered task using MCP service
                            task_idx = int(num_str) - 1
                            pending_tasks_data = await mcp_task_service.get_tasks_by_user(
                                db,
                                user_id=current_user.id,
                                status="todo"
                            )

                            if 0 <= task_idx < len(pending_tasks_data):
                                task_to_complete_data = pending_tasks_data[task_idx]
                                task_completed_data = await mcp_task_service.complete_task(
                                    db,
                                    task_id=task_to_complete_data["id"],
                                    user_id=current_user.id
                                )
                                if task_completed_data:
                                    # Convert back to Task object for compatibility
                                    task_completed = Task(
                                        id=task_completed_data["id"],
                                        user_id=task_completed_data["user_id"],
                                        title=task_completed_data["title"],
                                        description=task_completed_data["description"],
                                        status=TaskStatus(task_completed_data["status"]),
                                        priority=TaskPriority(task_completed_data["priority"]),
                                        due_date=datetime.fromisoformat(task_completed_data["due_date"]) if task_completed_data["due_date"] else None,
                                        created_at=datetime.fromisoformat(task_completed_data["created_at"]),
                                        updated_at=datetime.fromisoformat(task_completed_data["updated_at"])
                                    )
                    except ValueError:
                        pass  # Continue to default
                elif num_str.lower() in ['first', 'last']:
                    # Already handled above
                    pass

            if not task_completed:
                # Default: complete the oldest pending task using MCP service
                pending_tasks_data = await mcp_task_service.get_tasks_by_user(
                    db,
                    user_id=current_user.id,
                    status="todo"
                )
                if pending_tasks_data:
                    # Take the oldest (last in descending order)
                    first_task_data = pending_tasks_data[-1] if pending_tasks_data else None
                    if first_task_data:
                        task_completed_data = await mcp_task_service.complete_task(
                            db,
                            task_id=first_task_data["id"],
                            user_id=current_user.id
                        )
                        if task_completed_data:
                            # Convert back to Task object for compatibility
                            task_completed = Task(
                                id=task_completed_data["id"],
                                user_id=task_completed_data["user_id"],
                                title=task_completed_data["title"],
                                description=task_completed_data["description"],
                                status=TaskStatus(task_completed_data["status"]),
                                priority=TaskPriority(task_completed_data["priority"]),
                                due_date=datetime.fromisoformat(task_completed_data["due_date"]) if task_completed_data["due_date"] else None,
                                created_at=datetime.fromisoformat(task_completed_data["created_at"]),
                                updated_at=datetime.fromisoformat(task_completed_data["updated_at"])
                            )

            if task_completed:
                ai_response = f"🎉 Nice work! I've marked **{task_completed.title}** as completed. You're making great progress! 💪"
            else:
                ai_response = "You don't have any pending tasks to complete. Maybe you'd like to add a new one?"

        # Delete/remove intent detection - CHECK BEFORE general task word matching
        elif any(word in user_msg_lower for word in ["delete", "remove", "erase", "cancel", "kill", "trash"]):
            task_num_match = re.search(r'(?:task|#)\s*(\d+)|(\d+)\s*(?:st|nd|rd|th)\s*(?:task|one|item)|first|last', request.message, re.IGNORECASE)

            task_deleted = None
            if task_num_match:
                num_str = task_num_match.group(1) or task_num_match.group(2)
                if num_str:
                    try:
                        if num_str.lower() in ['first']:
                            # Delete first task using MCP service
                            all_tasks_data = await mcp_task_service.get_tasks_by_user(user_id=current_user.id)
                            if all_tasks_data:
                                # Take the last in descending order (oldest)
                                first_task_data = all_tasks_data[-1] if all_tasks_data else None
                                if first_task_data:
                                    success = await mcp_task_service.delete_task(
                                        db,
                                        task_id=first_task_data["id"],
                                        user_id=current_user.id
                                    )
                                    if success:
                                        # Create a Task object for compatibility
                                        task_deleted = Task(
                                            id=first_task_data["id"],
                                            user_id=first_task_data["user_id"],
                                            title=first_task_data["title"],
                                            description=first_task_data["description"],
                                            status=TaskStatus(first_task_data["status"]),
                                            priority=TaskPriority(first_task_data["priority"]),
                                            due_date=datetime.fromisoformat(first_task_data["due_date"]) if first_task_data["due_date"] else None,
                                            created_at=datetime.fromisoformat(first_task_data["created_at"]),
                                            updated_at=datetime.fromisoformat(first_task_data["updated_at"])
                                        )
                        elif num_str.lower() in ['last']:
                            # Delete last task using MCP service
                            all_tasks_data = await mcp_task_service.get_tasks_by_user(user_id=current_user.id)
                            if all_tasks_data:
                                # Take the first in descending order (newest)
                                last_task_data = all_tasks_data[0] if all_tasks_data else None
                                if last_task_data:
                                    success = await mcp_task_service.delete_task(
                                        db,
                                        task_id=last_task_data["id"],
                                        user_id=current_user.id
                                    )
                                    if success:
                                        # Create a Task object for compatibility
                                        task_deleted = Task(
                                            id=last_task_data["id"],
                                            user_id=last_task_data["user_id"],
                                            title=last_task_data["title"],
                                            description=last_task_data["description"],
                                            status=TaskStatus(last_task_data["status"]),
                                            priority=TaskPriority(last_task_data["priority"]),
                                            due_date=datetime.fromisoformat(last_task_data["due_date"]) if last_task_data["due_date"] else None,
                                            created_at=datetime.fromisoformat(last_task_data["created_at"]),
                                            updated_at=datetime.fromisoformat(last_task_data["updated_at"])
                                        )
                        else:
                            # Delete specific numbered task using MCP service
                            task_idx = int(num_str) - 1
                            all_tasks_data = await mcp_task_service.get_tasks_by_user(db, user_id=current_user.id)

                            if 0 <= task_idx < len(all_tasks_data):
                                task_to_delete_data = all_tasks_data[task_idx]
                                success = await mcp_task_service.delete_task(
                                    db,
                                    task_id=task_to_delete_data["id"],
                                    user_id=current_user.id
                                )
                                if success:
                                    # Create a Task object for compatibility
                                    task_deleted = Task(
                                        id=task_to_delete_data["id"],
                                        user_id=task_to_delete_data["user_id"],
                                        title=task_to_delete_data["title"],
                                        description=task_to_delete_data["description"],
                                        status=TaskStatus(task_to_delete_data["status"]),
                                        priority=TaskPriority(task_to_delete_data["priority"]),
                                        due_date=datetime.fromisoformat(task_to_delete_data["due_date"]) if task_to_delete_data["due_date"] else None,
                                        created_at=datetime.fromisoformat(task_to_delete_data["created_at"]),
                                        updated_at=datetime.fromisoformat(task_to_delete_data["updated_at"])
                                    )
                    except ValueError:
                        pass  # Invalid number

            if task_deleted:
                ai_response = f"🗑️ Got it! I've removed **{task_deleted.title}** from your list."
            else:
                ai_response = "I couldn't find a task to delete. Maybe you'd like to list your tasks first?"

        # Enhanced intent detection with more natural language patterns
        # Create/update task intent detection - ONLY IF OTHER INTENTS DON'T MATCH
        elif any(word in user_msg_lower for word in ["create", "add", "make", "new", "update", "change", "modify", "edit"]):
            # Extract task title from various patterns
            task_patterns = [
                r'(?:create|add|make|new|update|change|modify|edit)\s+(?:a\s+|the\s+|an\s+)?(?:task|to|for)?\s*(?:to\s+)?(.+?)(?:\.|$|please|now|and)',
                r'(?:want to|need to|should|must|gonna|going to|will)\s+(.+?)(?:\.|$|please|now|and)',
                r'(?:to|buy|get|do|buying|getting|doing)\s+(.+?)(?:\.|$|please|now|and)',
                r'(?:task[:\s]+|task\s+to\s+)(.+?)(?:\.|$|please|now|and)'
            ]

            task_title = "New task"  # default
            for pattern in task_patterns:
                task_match = re.search(pattern, request.message, re.IGNORECASE)
                if task_match:
                    task_title = task_match.group(1).strip()
                    break

            # Clean up the title
            task_title = re.sub(r'(task|to|for|a|an|the)', '', task_title, flags=re.IGNORECASE).strip()
            if not task_title or len(task_title) < 2:
                task_title = request.message.replace("create", "").replace("add", "").replace("make", "").replace("update", "").replace("change", "").strip()

            if not task_title or len(task_title) < 2:
                task_title = "New task"

            # Check if this is an update to an existing task by number
            task_num_match = re.search(r'(?:task|#)\s*(\d+)|(\d+)\s*(?:st|nd|rd|th)\s*(?:task|one)', request.message, re.IGNORECASE)

            if task_num_match and any(word in user_msg_lower for word in ["update", "change", "modify", "edit"]):
                # Update existing task
                num_str = task_num_match.group(1) or task_num_match.group(2)
                try:
                    task_idx = int(num_str) - 1
                    user_tasks_data = await mcp_task_service.get_tasks_by_user(db, user_id=current_user.id)

                    if 0 <= task_idx < len(user_tasks_data):
                        task_to_update_data = user_tasks_data[task_idx]
                        old_title = task_to_update_data["title"]

                        # Update using MCP service
                        updated_task_data = await mcp_task_service.update_task(
                            db,
                            task_id=task_to_update_data["id"],
                            user_id=current_user.id,
                            title=task_title[:100]
                        )

                        if updated_task_data:
                            # Convert to Task object for compatibility
                            task_to_update = Task(
                                id=updated_task_data["id"],
                                user_id=updated_task_data["user_id"],
                                title=updated_task_data["title"],
                                description=updated_task_data["description"],
                                status=TaskStatus(updated_task_data["status"]),
                                priority=TaskPriority(updated_task_data["priority"]),
                                due_date=datetime.fromisoformat(updated_task_data["due_date"]) if updated_task_data["due_date"] else None,
                                created_at=datetime.fromisoformat(updated_task_data["created_at"]),
                                updated_at=datetime.fromisoformat(updated_task_data["updated_at"])
                            )

                            ai_response = f"Got it! 😊 I've updated **'{old_title}'** to **'{task_to_update.title}'** in your list."
                        else:
                            ai_response = f"Sorry, I couldn't update task #{num_str}. Would you like to create a new task instead?"
                    else:
                        ai_response = f"Sorry, I couldn't find task #{num_str}. You have {len(user_tasks_data)} tasks. Would you like to create a new task instead?"
                except ValueError:
                    # Not a valid number, treat as new task using MCP service
                    new_task_data = await mcp_task_service.create_task(
                        db,
                        user_id=current_user.id,
                        title=task_title[:100],
                        description=f"Created from AI request: {request.message[:200]}"
                    )

                    # Convert to Task object for compatibility
                    new_task = Task(
                        id=new_task_data["id"],
                        user_id=new_task_data["user_id"],
                        title=new_task_data["title"],
                        description=new_task_data["description"],
                        status=TaskStatus(new_task_data["status"]),
                        priority=TaskPriority(new_task_data["priority"]),
                        due_date=datetime.fromisoformat(new_task_data["due_date"]) if new_task_data["due_date"] else None,
                        created_at=datetime.fromisoformat(new_task_data["created_at"]),
                        updated_at=datetime.fromisoformat(new_task_data["updated_at"])
                    )

                    ai_response = f"Got it! 😊 I've added **{new_task.title}** to your todo list."
            else:
                # Create new task using MCP service
                new_task_data = await mcp_task_service.create_task(
                    db,
                    user_id=current_user.id,
                    title=task_title[:100],
                    description=f"Created from AI request: {request.message[:200]}"
                )

                # Convert to Task object for compatibility
                new_task = Task(
                    id=new_task_data["id"],
                    user_id=new_task_data["user_id"],
                    title=new_task_data["title"],
                    description=new_task_data["description"],
                    status=TaskStatus(new_task_data["status"]),
                    priority=TaskPriority(new_task_data["priority"]),
                    due_date=datetime.fromisoformat(new_task_data["due_date"]) if new_task_data["due_date"] else None,
                    created_at=datetime.fromisoformat(new_task_data["created_at"]),
                    updated_at=datetime.fromisoformat(new_task_data["updated_at"])
                )

                ai_response = f"Got it! 😊 I've added **{new_task.title}** to your todo list."

        # Unclear intent - ask for clarification with guided options
        else:
            ai_response = f"""😊 I want to make sure I do the right thing.
What would you like to do?

You can say:
• add task buy milk
• show my tasks
• update task 2 to buy bread
• mark task 3 done
• delete task 1

Or ask for help if you're not sure!"""

        # Save AI response to database using JWT-derived user_id
        await save_message(db, conversation_id, current_user.id, MessageRole.ASSISTANT, ai_response)

        # Update conversation timestamp
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        conversation.updated_at = datetime.utcnow()
        db.commit()

        # Return response
        response = ChatResponse(
            response=ai_response,
            conversation_id=conversation_id,
            timestamp=datetime.utcnow()
        )

        logger.info(f"Successfully processed chat request for user {current_user.id}")
        return response

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

