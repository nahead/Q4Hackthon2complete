"""Gemini Agent for the AI Chatbot Todo application."""

import os
from typing import List, Dict, Any
import logging
import traceback
from datetime import datetime
import re

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiAgent:
    def __init__(self, mcp_client=None):
        """
        Initialize the Gemini Agent.

        Args:
            mcp_client: MCP client for tool integration (optional for now)
        """
        # Note: For this implementation, we'll use direct database operations
        # instead of relying on MCP tools to ensure reliability
        self.mcp_client = mcp_client

        # Verify API key is available
        api_key = os.getenv("GEMINI_API_KEY")
        logger.info(f"GEMINI_API_KEY availability: {'YES' if api_key else 'NO'}")

        if not api_key:
            logger.warning("GEMINI_API_KEY not found in environment")

        self.api_key = api_key

    async def process_intent_with_tools(self, user_message: str, user_id: int, conversation_history: List[Dict[str, str]]) -> str:
        """
        Process the user's intent using direct database operations.

        Args:
            user_message: The user's message
            user_id: The ID of the user
            conversation_history: The conversation history

        Returns:
            The agent's response
        """
        try:
            # Analyze the user message to determine intent
            user_msg_lower = user_message.lower()

            # Import database components here to avoid circular imports
            from sqlalchemy.orm import Session
            from src.database import SessionLocal
            from src.models import Task, TaskStatus, TaskPriority

            # Connect to database
            db: Session = SessionLocal()

            try:
                if any(word in user_msg_lower for word in ["create", "add", "make", "new", "task"]):
                    # Extract task title from the message (basic extraction)

                    # Look for phrases like "create task to buy groceries" or "add task: buy groceries"
                    task_match = re.search(r'(?:to|buy|get|do|buying|getting|doing|task[:\s]+|to\s+)(.+?)(?:\.|$|please|now)', user_message, re.IGNORECASE)
                    if not task_match:
                        task_match = re.search(r'(?:create|add|make|new)\s+(?:a\s+|the\s+|an\s+)?(.+?)(?:\.|$|please|now)', user_message, re.IGNORECASE)
                    if not task_match:
                        task_match = re.search(r'(?:want to|need to|should|will)\s+(.+?)(?:\.|$)', user_message, re.IGNORECASE)

                    task_title = "New task"  # default
                    if task_match:
                        task_title = task_match.group(1).strip()
                        # Clean up the title
                        task_title = re.sub(r'(task|to|for|a|an|the)', '', task_title, flags=re.IGNORECASE).strip()
                        if not task_title or len(task_title) < 2:
                            task_title = user_message.replace("create", "").replace("add", "").replace("make", "").strip()

                        if not task_title or len(task_title) < 2:
                            task_title = "New task"

                    # Create a new task in the database
                    new_task = Task(
                        user_id=user_id,
                        title=task_title[:100],  # Limit title length
                        description=f"Created from AI request: {user_message[:200]}",
                        status=TaskStatus.TODO,
                        priority=TaskPriority.MEDIUM,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )

                    db.add(new_task)
                    db.commit()
                    db.refresh(new_task)

                    return f"I've created a task for you: '{new_task.title}'. The task has been saved to your list!"

                elif any(word in user_msg_lower for word in ["list", "show", "view", "see", "my", "tasks"]):
                    # List user's tasks
                    tasks = db.query(Task).filter(Task.user_id == user_id).order_by(Task.created_at.desc()).all()

                    if not tasks:
                        return "You don't have any tasks yet. Would you like to create one?"

                    task_list = "\n".join([f"- {i+1}. {task.title} ({task.status.value})" for i, task in enumerate(tasks[:10])])  # Limit to 10
                    if len(tasks) > 10:
                        task_list += f"\n... and {len(tasks) - 10} more tasks"

                    return f"Here are your tasks:\n{task_list}"

                elif any(word in user_msg_lower for word in ["complete", "done", "finish", "mark", "completed"]):
                    # Try to identify specific task to complete
                    # Look for numbers like "task 1", "#1", "first task", etc.
                    task_num_match = re.search(r'(?:task|#)\s*(\d+)|(\d+)\s*(?:st|nd|rd|th)\s*task|first', user_message, re.IGNORECASE)

                    task_completed = None
                    if task_num_match:
                        # Try to complete specific task by number
                        num_str = task_num_match.group(1) or task_num_match.group(2)
                        if num_str:
                            try:
                                task_idx = int(num_str) - 1
                                pending_tasks = db.query(Task).filter(
                                    Task.user_id == user_id,
                                    Task.status != TaskStatus.COMPLETED
                                ).order_by(Task.created_at).all()

                                if 0 <= task_idx < len(pending_tasks):
                                    task_to_complete = pending_tasks[task_idx]
                                    task_to_complete.status = TaskStatus.COMPLETED
                                    task_to_complete.updated_at = datetime.utcnow()
                                    db.commit()
                                    task_completed = task_to_complete
                            except ValueError:
                                pass  # Continue to default

                    if not task_completed:
                        # Default: complete the oldest pending task
                        first_task = db.query(Task).filter(
                            Task.user_id == user_id,
                            Task.status != TaskStatus.COMPLETED
                        ).order_by(Task.created_at).first()

                        if first_task:
                            first_task.status = TaskStatus.COMPLETED
                            first_task.updated_at = datetime.utcnow()
                            db.commit()
                            task_completed = first_task

                    if task_completed:
                        return f"I've marked your task '{task_completed.title}' as completed!"
                    else:
                        return "You don't have any pending tasks to complete."

                else:
                    # For other requests, provide a helpful response
                    # This could be enhanced with actual Gemini API call if needed
                    if self.api_key:
                        # In a real implementation, we could call Gemini for natural language understanding
                        # For now, provide intelligent responses based on message content
                        if any(greeting in user_msg_lower for greeting in ["hello", "hi", "hey", "greetings"]):
                            return "Hello! I'm your AI assistant. You can ask me to create, list, or complete tasks for you."
                        elif any(help_word in user_msg_lower for help_word in ["help", "what can", "how to", "assist"]):
                            return "I can help you manage your tasks! You can ask me to: create a task, list your tasks, or mark tasks as complete."
                        else:
                            # Generic response for unrecognized commands
                            return f"I understand you said: '{user_message}'. You can ask me to create, list, or complete tasks!"
                    else:
                        return f"I received your message: '{user_message}'. The Gemini API key may not be configured properly, but I can still help with basic task operations!"

            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error processing intent with tools: {e}")
            logger.error(f"Exception type: {type(e).__name__}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return f"I encountered an error while processing your request: {str(e)}"