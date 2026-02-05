from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List, Optional
from ..database import SessionLocal
from ..models import Task as TaskModel, User as UserModel
from ..services.task_service import TaskService
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jose import JWTError
from ..config import config
from pydantic import BaseModel


# Define Pydantic models for API requests
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

# Dependency to get database session
def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Security scheme for JWT
security = HTTPBearer()

# Get current user from JWT token
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db_session)):
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

    user = db.query(UserModel).filter(UserModel.id == int(user_id)).first()

    if user is None:
        raise credentials_exception

    return user

router = APIRouter(prefix="/tasks", tags=["Tasks"])
task_service = TaskService()


@router.get("", response_model=dict)
def get_tasks(
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    limit: Optional[int] = Query(None, ge=1, le=100, description="Max number of results"),
    offset: Optional[int] = Query(None, ge=0, description="Offset for pagination"),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """
    Get all tasks for the current authenticated user
    """
    # Get tasks with filters
    tasks = task_service.get_tasks_by_user(
        user_id=current_user.id,
        db_session=db,
        completed=completed,
        limit=limit,
        offset=offset
    )

    # Count total tasks for the user (without limit/offset) to provide accurate pagination
    count_query = db.query(func.count(TaskModel.id)).filter(TaskModel.user_id == current_user.id)
    if completed is not None:
        count_query = count_query.filter(TaskModel.completed == completed)
    total_count = count_query.scalar()

    return {
        "success": True,
        "data": {
            "tasks": [
                {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "user_id": task.user_id,
                    "created_at": task.created_at.isoformat(),
                    "updated_at": task.updated_at.isoformat()
                } for task in tasks
            ],
            "total": total_count,
            "limit": limit,
            "offset": offset
        }
    }


@router.post("", status_code=status.HTTP_201_CREATED, response_model=dict)
def create_task(
    task_create: TaskCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """
    Create a new task for the current authenticated user
    """
    task = task_service.create_task(
        title=task_create.title,
        description=task_create.description,
        user_id=current_user.id,
        db_session=db
    )

    return {
        "success": True,
        "data": {
            "task": {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "user_id": task.user_id,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat()
            }
        }
    }


@router.get("/{task_id}", response_model=dict)
def get_task(
    task_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """
    Get a specific task by ID for the current authenticated user
    """
    task = task_service.get_task_by_id(
        task_id=task_id,
        user_id=current_user.id,
        db_session=db
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or you don't have permission to access it"
        )

    return {
        "success": True,
        "data": {
            "task": {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "user_id": task.user_id,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat()
            }
        }
    }


@router.put("/{task_id}", response_model=dict)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """
    Update a specific task by ID for the current authenticated user
    """
    task = task_service.update_task(
        task_id=task_id,
        title=task_update.title,
        description=task_update.description,
        completed=task_update.completed,
        user_id=current_user.id,
        db_session=db
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or you don't have permission to update it"
        )

    return {
        "success": True,
        "data": {
            "task": {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "user_id": task.user_id,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat()
            }
        }
    }


@router.delete("/{task_id}", response_model=dict)
def delete_task(
    task_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """
    Delete a specific task by ID for the current authenticated user
    """
    success = task_service.delete_task(
        task_id=task_id,
        user_id=current_user.id,
        db_session=db
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or you don't have permission to delete it"
        )

    return {
        "success": True,
        "data": {
            "message": "Task deleted successfully"
        }
    }