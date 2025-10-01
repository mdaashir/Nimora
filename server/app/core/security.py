"""
Core security utilities for payload handling and validation
"""
import base64
import json
import secrets
from typing import Dict, Any
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.exceptions import ValidationError, AuthenticationError
from app.core.logging import get_logger

logger = get_logger(__name__)


class PayloadSecurity:
    """Enhanced payload security with better error handling"""

    @staticmethod
    def encode_payload(data: Dict[str, Any]) -> str:
        """
        Encode payload data with multi-layer security

        Args:
            data: Dictionary to encode

        Returns:
            Encoded string
        """
        try:
            # Convert to JSON string
            json_string = json.dumps(data, separators=(',', ':'))

            # Base64 encode
            encoded = base64.b64encode(json_string.encode('utf-8')).decode('utf-8')

            # Add obfuscation (reverse and add salt)
            obfuscated = encoded[::-1] + settings.payload_salt

            # Final base64 encoding
            return base64.b64encode(obfuscated.encode('utf-8')).decode('utf-8')

        except Exception as e:
            logger.error(f"Error encoding payload: {str(e)}")
            raise ValidationError("Failed to encode payload")

    @staticmethod
    def decode_payload(encoded_data: str) -> Dict[str, Any]:
        """
        Decode payload data with multi-layer security

        Args:
            encoded_data: Encoded string to decode

        Returns:
            Decoded dictionary

        Raises:
            ValidationError: If payload format is invalid
        """
        try:
            # Ensure encoded_data is a string
            if isinstance(encoded_data, bytes):
                encoded_data = encoded_data.decode('utf-8')

            # Remove first base64 encoding
            try:
                obfuscated = base64.b64decode(encoded_data).decode('utf-8')
            except Exception as e:
                logger.warning(f"First base64 decode failed: {str(e)}")
                raise ValidationError("Invalid payload format - first layer")

            # Remove salt and reverse
            salt = settings.payload_salt
            if not obfuscated.endswith(salt):
                logger.warning("Salt not found at end of obfuscated data")
                raise ValidationError("Invalid payload format - salt missing")

            reversed_data = obfuscated[:-len(salt)][::-1]

            # Decode base64 (second layer)
            try:
                json_string = base64.b64decode(reversed_data).decode('utf-8')
            except Exception as e:
                logger.warning(f"Second base64 decode failed: {str(e)}")
                raise ValidationError("Invalid payload format - second layer")

            # Parse JSON
            try:
                return json.loads(json_string)
            except json.JSONDecodeError as e:
                logger.warning(f"JSON decode failed: {str(e)}")
                raise ValidationError("Invalid payload format - JSON parsing")

        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error decoding payload: {str(e)}")
            raise ValidationError("Failed to decode payload")


class CredentialValidator:
    """Validate user credentials and input data"""

    @staticmethod
    def validate_roll_number(roll_no: str) -> str:
        """
        Validate and sanitize roll number

        Args:
            roll_no: Roll number to validate

        Returns:
            Sanitized roll number

        Raises:
            ValidationError: If roll number is invalid
        """
        if not roll_no or not isinstance(roll_no, str):
            raise ValidationError("Roll number is required")

        # Remove whitespace and convert to lowercase
        roll_no = roll_no.strip().lower()

        # Basic validation - adjust regex based on your format
        if len(roll_no) < 6 or len(roll_no) > 20:
            raise ValidationError("Roll number must be between 6-20 characters")

        # Check for valid characters (alphanumeric)
        if not roll_no.replace('-', '').replace('_', '').isalnum():
            raise ValidationError("Roll number contains invalid characters")

        return roll_no

    @staticmethod
    def validate_password(password: str) -> None:
        """
        Validate password

        Args:
            password: Password to validate

        Raises:
            ValidationError: If password is invalid
        """
        if not password or not isinstance(password, str):
            raise ValidationError("Password is required")

        if len(password) < 6:
            raise ValidationError("Password must be at least 6 characters long")

        if len(password) > 100:
            raise ValidationError("Password is too long")


def generate_request_id() -> str:
    """Generate a unique request ID for correlation"""
    return secrets.token_urlsafe(16)


def sanitize_input(input_string: str) -> str:
    """
    Sanitize input to prevent XSS and other attacks

    Args:
        input_string: String to sanitize

    Returns:
        Sanitized string
    """
    if not isinstance(input_string, str):
        return input_string

    # Remove potentially dangerous characters
    dangerous_chars = ['<', '>', '"', "'", '&', '%', '$']
    for char in dangerous_chars:
        input_string = input_string.replace(char, '')

    return input_string.strip()
