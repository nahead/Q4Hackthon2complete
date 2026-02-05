"""MCP Server for the AI Chatbot Todo application."""

import asyncio
from typing import Dict, Any, List
from mcp.server import Server
from mcp.server.models import InitOptions
from mcp.types import TextContent, ImageContent, ChatMessage, ToolCall
import logging
from sqlmodel import create_engine, Session, select
from models import Task, User, Conversation, Message, TaskStatus, TaskPriority
from urllib.parse import urlparse
import os
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup - prioritize NeonDB
NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL")
DATABASE_URL = NEON_DATABASE_URL or os.getenv("DATABASE_URL", "sqlite:///./todo_app.db")
engine = create_engine(DATABASE_URL)

server = Server("ai-chatbot-mcp-server")

# In-memory cache for demonstration (in production, use Redis or similar)
cache: Dict[str, Any] = {}


@server.list_tools()
async def list_tools() -> List[Dict[str, Any]]:
    """List all available MCP tools."""
    return [
        {
            "name": "create_task",
            "description": "Create a new todo task",
            "input_schema": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "integer", "description": "ID of the user"},
                    "title": {"type": "string", "description": "Title of the task"},
                    "description": {"type": "string", "description": "Description of the task"},
                    "priority": {"type": "string", "description": "Priority of the task (low, medium, high)"},
                    "due_date": {"type": "string", "description": "Due date in ISO format"}
                },
                "required": ["user_id", "title"]
            }
        },
        {
            "name": "list_tasks",
            "description": "List all tasks for a user",
            "input_schema": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "integer", "description": "ID of the user"},
                    "status": {"type": "string", "description": "Filter by status (todo, in_progress, completed)"},
                    "priority": {"type": "string", "description": "Filter by priority (low, medium, high)"}
                },
                "required": ["user_id"]
            }
        },
        {
            "name": "update_task",
            "description": "Update an existing task",
            "input_schema": {
                "type": "object",
                "properties": {
                    "task_id": {"type": "integer", "description": "ID of the task to update"},
                    "title": {"type": "string", "description": "New title of the task"},
                    "description": {"type": "string", "description": "New description of the task"},
                    "priority": {"type": "string", "description": "New priority of the task"},
                    "status": {"type": "string", "description": "New status of the task"},
                    "due_date": {"type": "string", "description": "New due date in ISO format"}
                },
                "required": ["task_id"]
            }
        },
        {
            "name": "delete_task",
            "description": "Delete a task",
            "input_schema": {
                "type": "object",
                "properties": {
                    "task_id": {"type": "integer", "description": "ID of the task to delete"}
                },
                "required": ["task_id"]
            }
        },
        {
            "name": "complete_task",
            "description": "Mark a task as completed",
            "input_schema": {
                "type": "object",
                "properties": {
                    "task_id": {"type": "integer", "description": "ID of the task to complete"}
                },
                "required": ["task_id"]
            }
        }
    ]


@server.call_tool()
async def call_tool(name: str, arguments: Dict[str, Any]) -> List[ChatMessage]:
    """Handle tool calls."""
    logger.info(f"Tool called: {name} with args: {arguments}")

    if name == "create_task":
        result = await handle_create_task(arguments)
    elif name == "list_tasks":
        result = await handle_list_tasks(arguments)
    elif name == "update_task":
        result = await handle_update_task(arguments)
    elif name == "delete_task":
        result = await handle_delete_task(arguments)
    elif name == "complete_task":
        result = await handle_complete_task(arguments)
    else:
        result = [{"role": "system", "content": f"Unknown tool: {name}"}]

    return result


async def handle_create_task(args: Dict[str, Any]) -> List[ChatMessage]:
    """Handle create_task tool call."""
    try:
        with Session(engine) as session:
            task = Task(
                user_id=args["user_id"],
                title=args["title"],
                description=args.get("description"),
                priority=TaskPriority(args.get("priority", "medium")),
                due_date=datetime.fromisoformat(args["due_date"]) if args.get("due_date") else None
            )
            session.add(task)
            session.commit()
            session.refresh(task)

            response = f"Task '{task.title}' created successfully with ID {task.id}"
            return [{"role": "assistant", "content": response}]
    except Exception as e:
        logger.error(f"Error creating task: {e}")
        return [{"role": "system", "content": f"Error creating task: {str(e)}"}]


async def handle_list_tasks(args: Dict[str, Any]) -> List[ChatMessage]:
    """Handle list_tasks tool call."""
    try:
        with Session(engine) as session:
            query = select(Task).where(Task.user_id == args["user_id"])

            if args.get("status"):
                query = query.where(Task.status == TaskStatus(args["status"]))

            if args.get("priority"):
                query = query.where(Task.priority == TaskPriority(args["priority"]))

            tasks = session.exec(query).all()

            if not tasks:
                return [{"role": "assistant", "content": "No tasks found for this user."}]

            task_list = []
            for task in tasks:
                task_str = f"- ID: {task.id}, Title: {task.title}, Status: {task.status.value}, Priority: {task.priority.value}"
                if task.due_date:
                    task_str += f", Due: {task.due_date.strftime('%Y-%m-%d')}"
                task_list.append(task_str)

            response = "Your tasks:\n" + "\n".join(task_list)
            return [{"role": "assistant", "content": response}]
    except Exception as e:
        logger.error(f"Error listing tasks: {e}")
        return [{"role": "system", "content": f"Error listing tasks: {str(e)}"}]


async def handle_update_task(args: Dict[str, Any]) -> List[ChatMessage]:
    """Handle update_task tool call."""
    try:
        with Session(engine) as session:
            task = session.get(Task, args["task_id"])
            if not task:
                return [{"role": "system", "content": f"Task with ID {args['task_id']} not found"}]

            # Update task fields
            if "title" in args:
                task.title = args["title"]
            if "description" in args:
                task.description = args["description"]
            if "priority" in args:
                task.priority = TaskPriority(args["priority"])
            if "status" in args:
                task.status = TaskStatus(args["status"])
            if "due_date" in args:
                task.due_date = datetime.fromisoformat(args["due_date"]) if args["due_date"] else None

            task.updated_at = datetime.utcnow()
            session.add(task)
            session.commit()
            session.refresh(task)

            response = f"Task '{task.title}' (ID: {task.id}) updated successfully"
            return [{"role": "assistant", "content": response}]
    except Exception as e:
        logger.error(f"Error updating task: {e}")
        return [{"role": "system", "content": f"Error updating task: {str(e)}"}]


async def handle_delete_task(args: Dict[str, Any]) -> List[ChatMessage]:
    """Handle delete_task tool call."""
    try:
        with Session(engine) as session:
            task = session.get(Task, args["task_id"])
            if not task:
                return [{"role": "system", "content": f"Task with ID {args['task_id']} not found"}]

            session.delete(task)
            session.commit()

            response = f"Task '{task.title}' (ID: {task.id}) deleted successfully"
            return [{"role": "assistant", "content": response}]
    except Exception as e:
        logger.error(f"Error deleting task: {e}")
        return [{"role": "system", "content": f"Error deleting task: {str(e)}"}]


async def handle_complete_task(args: Dict[str, Any]) -> List[ChatMessage]:
    """Handle complete_task tool call."""
    try:
        with Session(engine) as session:
            task = session.get(Task, args["task_id"])
            if not task:
                return [{"role": "system", "content": f"Task with ID {args['task_id']} not found"}]

            task.status = TaskStatus.COMPLETED
            task.updated_at = datetime.utcnow()
            session.add(task)
            session.commit()
            session.refresh(task)

            response = f"Task '{task.title}' (ID: {task.id}) marked as completed"
            return [{"role": "assistant", "content": response}]
    except Exception as e:
        logger.error(f"Error completing task: {e}")
        return [{"role": "system", "content": f"Error completing task: {str(e)}"}]


async def main():
    """Run the MCP server."""
    async with server.with_manually_managed_loop():
        # Register initialization options
        server.set_global_error_handler(lambda e: print(f"Server error: {e}"))

        # The server will listen for requests until interrupted
        print("MCP Server started. Press Ctrl+C to stop.")
        try:
            await asyncio.Future()  # Run forever
        except KeyboardInterrupt:
            print("Shutting down...")


if __name__ == "__main__":
    asyncio.run(main())