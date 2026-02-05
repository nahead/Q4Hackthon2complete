"""Task service for the AI Chatbot Todo application.

This service contains business logic that is used exclusively by MCP tools.
"""

from sqlmodel import Session, select
from models import Task, TaskStatus, TaskPriority
from typing import List, Optional
from datetime import datetime


def create_task(
    session: Session,
    user_id: int,
    title: str,
    description: Optional[str] = None,
    priority: TaskPriority = TaskPriority.MEDIUM,
    due_date: Optional[datetime] = None
) -> Task:
    """Create a new task."""
    task = Task(
        user_id=user_id,
        title=title,
        description=description,
        priority=priority,
        due_date=due_date
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def get_tasks_by_user(
    session: Session,
    user_id: int,
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None
) -> List[Task]:
    """Get all tasks for a specific user with optional filters."""
    query = select(Task).where(Task.user_id == user_id)

    if status:
        query = query.where(Task.status == status)

    if priority:
        query = query.where(Task.priority == priority)

    return session.exec(query).all()


def update_task(
    session: Session,
    task_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[TaskPriority] = None,
    status: Optional[TaskStatus] = None,
    due_date: Optional[datetime] = None
) -> Optional[Task]:
    """Update an existing task."""
    task = session.get(Task, task_id)
    if not task:
        return None

    # Update task fields
    if title is not None:
        task.title = title
    if description is not None:
        task.description = description
    if priority is not None:
        task.priority = priority
    if status is not None:
        task.status = status
    if due_date is not None:
        task.due_date = due_date

    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def delete_task(session: Session, task_id: int) -> bool:
    """Delete a task by ID."""
    task = session.get(Task, task_id)
    if not task:
        return False

    session.delete(task)
    session.commit()
    return True


def complete_task(session: Session, task_id: int) -> Optional[Task]:
    """Mark a task as completed."""
    task = session.get(Task, task_id)
    if not task:
        return None

    task.status = TaskStatus.COMPLETED
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task