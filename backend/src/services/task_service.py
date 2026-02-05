from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from src.models import Task as TaskModel, TaskStatus
from datetime import datetime


class TaskService:
    def __init__(self):
        pass

    def create_task(self, title: str, description: Optional[str], user_id: int, db_session: Session) -> TaskModel:
        """
        Create a new task for a specific user
        """
        # Create task instance with provided data and user_id
        db_task = TaskModel(
            title=title,
            description=description,
            completed=False,  # Default to not completed
            status=TaskStatus.TODO,  # Default to TODO status
            user_id=user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db_session.add(db_task)
        db_session.commit()
        db_session.refresh(db_task)

        return db_task

    def get_task_by_id(self, task_id: int, user_id: int, db_session: Session) -> Optional[TaskModel]:
        """
        Retrieve a task by its ID for a specific user
        """
        # Ensure the task belongs to the user making the request
        task = db_session.query(TaskModel).filter(TaskModel.id == task_id).filter(TaskModel.user_id == user_id).first()
        return task

    def get_tasks_by_user(self, user_id: int, db_session: Session,
                         completed: Optional[bool] = None,
                         limit: Optional[int] = None,
                         offset: Optional[int] = None) -> List[TaskModel]:
        """
        Retrieve all tasks for a specific user with optional filters
        """
        query = db_session.query(TaskModel).filter(TaskModel.user_id == user_id)

        if completed is not None:
            query = query.filter(TaskModel.completed == completed)

        if limit is not None:
            query = query.limit(limit)

        if offset is not None:
            query = query.offset(offset)

        return query.all()

    def update_task(self, task_id: int, title: Optional[str] = None, description: Optional[str] = None,
                   completed: Optional[bool] = None, user_id: int = None, db_session: Session = None) -> Optional[TaskModel]:
        """
        Update a task for a specific user
        """
        # First, get the task to ensure it belongs to the user
        db_task = self.get_task_by_id(task_id, user_id, db_session)
        if not db_task:
            return None

        # Update the task with provided values
        if title is not None:
            db_task.title = title
        if description is not None:
            db_task.description = description
        if completed is not None:
            db_task.completed = completed
            # Update status accordingly
            if completed:
                db_task.status = TaskStatus.COMPLETED
            else:
                db_task.status = TaskStatus.TODO
        db_task.updated_at = datetime.utcnow()

        db_session.commit()
        db_session.refresh(db_task)

        return db_task

    def delete_task(self, task_id: int, user_id: int, db_session: Session) -> bool:
        """
        Delete a task for a specific user
        """
        # First, get the task to ensure it belongs to the user
        db_task = self.get_task_by_id(task_id, user_id, db_session)
        if not db_task:
            return False

        db_session.delete(db_task)
        db_session.commit()
        return True

    def toggle_task_completion(self, task_id: int, user_id: int, db_session: Session) -> Optional[TaskModel]:
        """
        Toggle the completion status of a task
        """
        db_task = self.get_task_by_id(task_id, user_id, db_session)
        if not db_task:
            return None

        db_task.completed = not db_task.completed
        db_session.commit()
        db_session.refresh(db_task)

        return db_task