import logging
import sys
from datetime import datetime
from typing import Optional
from enum import Enum

class LogLevel(Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"

class Logger:
    """
    Custom logging utility for the Todo application
    Provides structured logging with consistent formatting
    """

    def __init__(self, name: str = "todo_app", level: LogLevel = LogLevel.INFO):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, level.value))

        # Prevent duplicate handlers
        if not self.logger.handlers:
            self._setup_handlers()

    def _setup_handlers(self):
        """Setup console and file handlers"""
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(self._get_formatter())
        self.logger.addHandler(console_handler)

        # File handler (optional - can be configured based on environment)
        try:
            file_handler = logging.FileHandler('todo_app.log')
            file_handler.setFormatter(self._get_formatter())
            self.logger.addHandler(file_handler)
        except Exception:
            # If file logging fails, continue with console only
            pass

    def _get_formatter(self) -> logging.Formatter:
        """Get standard formatter for log messages"""
        return logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )

    def _log(self, level: LogLevel, message: str, user_id: Optional[int] = None,
             request_id: Optional[str] = None, **kwargs):
        """Internal logging method with structured data"""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level.value,
            "message": message
        }

        if user_id is not None:
            log_data["user_id"] = user_id
        if request_id is not None:
            log_data["request_id"] = request_id

        # Add any additional structured data
        log_data.update(kwargs)

        # Log the message
        getattr(self.logger, level.value.lower())(str(log_data))

    def debug(self, message: str, user_id: Optional[int] = None,
              request_id: Optional[str] = None, **kwargs):
        """Log debug message"""
        self._log(LogLevel.DEBUG, message, user_id, request_id, **kwargs)

    def info(self, message: str, user_id: Optional[int] = None,
             request_id: Optional[str] = None, **kwargs):
        """Log info message"""
        self._log(LogLevel.INFO, message, user_id, request_id, **kwargs)

    def warning(self, message: str, user_id: Optional[int] = None,
                request_id: Optional[str] = None, **kwargs):
        """Log warning message"""
        self._log(LogLevel.WARNING, message, user_id, request_id, **kwargs)

    def error(self, message: str, user_id: Optional[int] = None,
              request_id: Optional[str] = None, **kwargs):
        """Log error message"""
        self._log(LogLevel.ERROR, message, user_id, request_id, **kwargs)

    def critical(self, message: str, user_id: Optional[int] = None,
                 request_id: Optional[str] = None, **kwargs):
        """Log critical message"""
        self._log(LogLevel.CRITICAL, message, user_id, request_id, **kwargs)


# Global logger instance
app_logger = Logger()


# Convenience functions
def log_debug(message: str, user_id: Optional[int] = None,
              request_id: Optional[str] = None, **kwargs):
    """Log a debug message"""
    app_logger.debug(message, user_id, request_id, **kwargs)


def log_info(message: str, user_id: Optional[int] = None,
             request_id: Optional[str] = None, **kwargs):
    """Log an info message"""
    app_logger.info(message, user_id, request_id, **kwargs)


def log_warning(message: str, user_id: Optional[int] = None,
                request_id: Optional[str] = None, **kwargs):
    """Log a warning message"""
    app_logger.warning(message, user_id, request_id, **kwargs)


def log_error(message: str, user_id: Optional[int] = None,
              request_id: Optional[str] = None, **kwargs):
    """Log an error message"""
    app_logger.error(message, user_id, request_id, **kwargs)


def log_critical(message: str, user_id: Optional[int] = None,
                 request_id: Optional[str] = None, **kwargs):
    """Log a critical message"""
    app_logger.critical(message, user_id, request_id, **kwargs)


# Context manager for request logging
class RequestLogger:
    """Context manager for logging request lifecycle"""

    def __init__(self, request_id: str, user_id: Optional[int] = None):
        self.request_id = request_id
        self.user_id = user_id
        self.start_time = None

    def __enter__(self):
        self.start_time = datetime.utcnow()
        log_info(
            "Request started",
            request_id=self.request_id,
            user_id=self.user_id,
            event="request_start"
        )
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = (datetime.utcnow() - self.start_time).total_seconds() if self.start_time else 0

        if exc_type is not None:
            log_error(
                f"Request failed with exception: {exc_type.__name__}: {exc_val}",
                request_id=self.request_id,
                user_id=self.user_id,
                event="request_failed",
                duration=duration,
                exception=str(exc_val)
            )
        else:
            log_info(
                "Request completed successfully",
                request_id=self.request_id,
                user_id=self.user_id,
                event="request_complete",
                duration=duration
            )


# Decorator for automatic request logging
def log_requests(func):
    """Decorator to automatically log requests to a function"""
    def wrapper(*args, user_id: Optional[int] = None, request_id: Optional[str] = None, **kwargs):
        with RequestLogger(request_id or "unknown", user_id):
            try:
                result = func(*args, **kwargs)
                return result
            except Exception as e:
                log_error(
                    f"Function {func.__name__} failed: {str(e)}",
                    user_id=user_id,
                    request_id=request_id,
                    function=func.__name__,
                    exception=str(e)
                )
                raise
    return wrapper


# Initialize the logger
logger = Logger("todo_app")