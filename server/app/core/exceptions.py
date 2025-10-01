"""
Custom exceptions for the Nimora API
"""
from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class NimoraException(Exception):
    """Base exception for Nimora API"""

    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class AuthenticationError(NimoraException):
    """Raised when authentication fails"""
    pass


class ScrapingError(NimoraException):
    """Raised when web scraping fails"""
    pass


class DataProcessingError(NimoraException):
    """Raised when data processing fails"""
    pass


class ExternalServiceError(NimoraException):
    """Raised when external service is unavailable"""
    pass


class ValidationError(NimoraException):
    """Raised when data validation fails"""
    pass


class RateLimitError(NimoraException):
    """Raised when rate limit is exceeded"""
    pass


# HTTP Exception mappings
def create_http_exception(
    exception: NimoraException,
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
) -> HTTPException:
    """Convert custom exception to HTTP exception"""

    detail = {
        "message": exception.message,
        "type": exception.__class__.__name__,
        **exception.details
    }

    return HTTPException(status_code=status_code, detail=detail)


# Exception to HTTP status code mapping
EXCEPTION_STATUS_MAP = {
    AuthenticationError: status.HTTP_401_UNAUTHORIZED,
    ValidationError: status.HTTP_422_UNPROCESSABLE_ENTITY,
    RateLimitError: status.HTTP_429_TOO_MANY_REQUESTS,
    ExternalServiceError: status.HTTP_503_SERVICE_UNAVAILABLE,
    ScrapingError: status.HTTP_502_BAD_GATEWAY,
    DataProcessingError: status.HTTP_500_INTERNAL_SERVER_ERROR,
}
