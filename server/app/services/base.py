"""
Base service class with common functionality
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from requests import Session

from app.core.logging import get_logger
from app.core.exceptions import AuthenticationError, ScrapingError


class BaseService(ABC):
    """Base service class with common functionality"""

    def __init__(self):
        self.logger = get_logger(self.__class__.__name__)

    def log_operation(self, operation: str, **kwargs):
        """Log service operation with context"""
        self.logger.info(f"Executing {operation}", extra=kwargs)

    def handle_error(self, error: Exception, operation: str, **context):
        """Handle and log service errors"""
        self.logger.error(
            f"Error in {operation}: {str(error)}",
            extra={"operation": operation, **context},
            exc_info=True
        )


class AuthenticationService(BaseService):
    """Service for handling authentication and session management"""

    async def create_session(self, rollno: str, password: str, login_type: str = "attendance") -> Session:
        """
        Create authenticated session for PSG Tech portal

        Args:
            rollno: Student roll number
            password: Student password
            login_type: Type of login (attendance, cgpa)

        Returns:
            Authenticated session

        Raises:
            AuthenticationError: If authentication fails
        """
        self.log_operation("create_session", rollno=rollno, login_type=login_type)

        try:
            if login_type == "attendance":
                return self._create_attendance_session(rollno, password)
            elif login_type == "cgpa":
                return self._create_cgpa_session(rollno, password)
            else:
                raise ValueError(f"Unknown login type: {login_type}")

        except Exception as e:
            self.handle_error(e, "create_session", rollno=rollno, login_type=login_type)
            raise AuthenticationError(f"Failed to authenticate user: {str(e)}")

    def _create_attendance_session(self, rollno: str, password: str) -> Session:
        """Create session for attendance portal"""
        # Import here to avoid circular imports
        from util.HomePage import getHomePageAttendance

        session = getHomePageAttendance(rollno, password)
        if not session:
            raise AuthenticationError("Invalid credentials for attendance portal")

        return session

    def _create_cgpa_session(self, rollno: str, password: str) -> Session:
        """Create session for CGPA portal"""
        # Import here to avoid circular imports
        from util.HomePage import getHomePageCGPA

        session = getHomePageCGPA(rollno, password)
        if not session:
            raise AuthenticationError("Invalid credentials for CGPA portal")

        return session

    async def validate_session(self, session: Session) -> bool:
        """
        Validate if session is still active

        Args:
            session: Session to validate

        Returns:
            True if session is valid
        """
        try:
            # Simple validation by making a request to the portal
            response = session.get("https://ecampus.psgtech.ac.in/studzone", timeout=10)
            return response.status_code == 200
        except Exception as e:
            self.logger.warning(f"Session validation failed: {str(e)}")
            return False
