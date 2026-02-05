from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from src.models import User
from src.utils.jwt import verify_password, get_password_hash
from pydantic import BaseModel, field_validator
import re


# Define Pydantic models for user operations
class UserCreate(BaseModel):
    email: str
    password: str

    @field_validator('email')
    @classmethod
    def validate_email_format(cls, v):
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, v):
            raise ValueError("Invalid email format")
        return v

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        return v


class UserUpdate(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator('email', mode='before')
    @classmethod
    def validate_email_format(cls, v):
        if v is not None:
            pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(pattern, v):
                raise ValueError("Invalid email format")
        return v

    @field_validator('password', mode='before')
    @classmethod
    def validate_password_strength(cls, v):
        if v is not None and len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        return v


class UserService:
    def __init__(self):
        pass

    def create_user(self, user_create: UserCreate, db_session: Session) -> User:
        """
        Create a new user with hashed password
        """
        # Check if user already exists
        existing_user = db_session.query(User).filter(User.email == user_create.email).first()

        if existing_user:
            raise ValueError(f"User with email {user_create.email} already exists")

        # Create new user with hashed password
        hashed_password = get_password_hash(user_create.password)
        db_user = User(
            email=user_create.email,
            password_hash=hashed_password,
            name=""  # Default empty name - can be updated later
        )

        db_session.add(db_user)
        db_session.commit()
        db_session.refresh(db_user)

        return db_user

    def get_user_by_id(self, user_id: int, db_session: Session) -> Optional[User]:
        """
        Retrieve a user by their ID
        """
        return db_session.query(User).filter(User.id == user_id).first()

    def get_user_by_email(self, email: str, db_session: Session) -> Optional[User]:
        """
        Retrieve a user by their email
        """
        return db_session.query(User).filter(User.email == email).first()

    def authenticate_user(self, email: str, password: str, db_session: Session) -> Optional[User]:
        """
        Authenticate a user by email and password
        """
        user = self.get_user_by_email(email, db_session)
        if not user:
            return None

        if not verify_password(password, user.password_hash):
            return None

        return user

    def update_user(self, user_id: int, user_update: UserUpdate, db_session: Session) -> Optional[User]:
        """
        Update user information
        """
        db_user = self.get_user_by_id(user_id, db_session)
        if not db_user:
            return None

        # Update fields if they are provided
        update_data = user_update.model_dump(exclude_unset=True) if hasattr(user_update, 'model_dump') else user_update.dict(exclude_unset=True)

        # If password is being updated, hash it
        if "password" in update_data:
            update_data["password_hash"] = get_password_hash(update_data.pop("password"))

        for field, value in update_data.items():
            setattr(db_user, field, value)

        db_session.add(db_user)
        db_session.commit()
        db_session.refresh(db_user)

        return db_user

    def delete_user(self, user_id: int, db_session: Session) -> bool:
        """
        Delete a user by ID
        """
        user = self.get_user_by_id(user_id, db_session)
        if not user:
            return False

        db_session.delete(user)
        db_session.commit()
        return True

    def activate_user(self, user_id: int, db_session: Session) -> Optional[User]:
        """
        Activate a user account
        """
        user = self.get_user_by_id(user_id, db_session)
        if not user:
            return None

        user.is_active = True
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        return user

    def deactivate_user(self, user_id: int, db_session: Session) -> Optional[User]:
        """
        Deactivate a user account
        """
        user = self.get_user_by_id(user_id, db_session)
        if not user:
            return None

        user.is_active = False
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        return user