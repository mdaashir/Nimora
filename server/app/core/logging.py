"""
Structured logging configuration for Nimora API
"""
import logging
import sys
import json
import traceback
from datetime import datetime
from typing import Dict, Any, Optional
from contextvars import ContextVar
from functools import wraps

from app.core.config import settings

# Context variable for request correlation
request_id_var: ContextVar[Optional[str]] = ContextVar('request_id', default=None)


class StructuredFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""

    def format(self, record: logging.LogRecord) -> str:
        # Base log entry
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add request ID if available
        request_id = request_id_var.get()
        if request_id:
            log_entry["request_id"] = request_id

        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": traceback.format_exception(*record.exc_info)
            }

        # Add extra fields
        for key, value in record.__dict__.items():
            if key not in [
                'name', 'msg', 'args', 'levelname', 'levelno', 'pathname',
                'filename', 'module', 'exc_info', 'exc_text', 'stack_info',
                'lineno', 'funcName', 'created', 'msecs', 'relativeCreated',
                'thread', 'threadName', 'processName', 'process', 'message'
            ]:
                log_entry[key] = value

        return json.dumps(log_entry, default=str)


def setup_logging():
    """Setup structured logging for the application"""

    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.log_level.upper()))

    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, settings.log_level.upper()))

    # Set formatter based on environment
    if settings.environment == "development":
        # Human-readable format for development
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    else:
        # Structured JSON format for production
        formatter = StructuredFormatter()

    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Set third-party loggers to WARNING to reduce noise
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.WARNING)
    logging.getLogger("requests").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with proper configuration"""
    return logging.getLogger(name)


def log_function_call(func):
    """Decorator to log function calls with parameters"""
    logger = get_logger(func.__module__)

    @wraps(func)
    def wrapper(*args, **kwargs):
        # Log function entry
        logger.info(
            f"Calling {func.__name__}",
            extra={
                "function": func.__name__,
                "args_count": len(args),
                "kwargs_keys": list(kwargs.keys())
            }
        )

        try:
            result = func(*args, **kwargs)
            logger.info(f"Completed {func.__name__} successfully")
            return result
        except Exception as e:
            logger.error(
                f"Error in {func.__name__}: {str(e)}",
                extra={
                    "function": func.__name__,
                    "error_type": type(e).__name__
                },
                exc_info=True
            )
            raise

    return wrapper


def log_api_call(endpoint: str, method: str, status_code: int, duration: float):
    """Log API call with metrics"""
    logger = get_logger("nimora.api")

    log_data = {
        "endpoint": endpoint,
        "method": method,
        "status_code": status_code,
        "duration_ms": round(duration * 1000, 2),
        "request_id": request_id_var.get()
    }

    if status_code >= 400:
        logger.error("API request failed", extra=log_data)
    else:
        logger.info("API request completed", extra=log_data)


# Initialize logging when module is imported
setup_logging()
