"""
Rate limiting middleware and utilities
"""
import time
from typing import Dict, Optional
from collections import defaultdict, deque
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class InMemoryRateLimiter:
    """
    In-memory rate limiter using sliding window algorithm
    For production, consider using Redis-based rate limiting
    """

    def __init__(self, max_requests: int = 60, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, deque] = defaultdict(deque)

    def is_allowed(self, identifier: str) -> tuple[bool, Dict[str, any]]:
        """
        Check if request is allowed based on rate limits

        Args:
            identifier: Unique identifier for rate limiting (IP, user, etc.)

        Returns:
            Tuple of (is_allowed, rate_limit_info)
        """
        now = time.time()
        window_start = now - self.window_seconds

        # Clean old requests
        user_requests = self.requests[identifier]
        while user_requests and user_requests[0] < window_start:
            user_requests.popleft()

        # Check if limit exceeded
        current_requests = len(user_requests)
        is_allowed = current_requests < self.max_requests

        if is_allowed:
            user_requests.append(now)

        # Rate limit information
        rate_limit_info = {
            "limit": self.max_requests,
            "remaining": max(0, self.max_requests - current_requests - (1 if is_allowed else 0)),
            "reset_time": int(window_start + self.window_seconds),
            "retry_after": int(self.window_seconds) if not is_allowed else None
        }

        return is_allowed, rate_limit_info


# Global rate limiter instance
rate_limiter = InMemoryRateLimiter(
    max_requests=settings.rate_limit_per_minute,
    window_seconds=60
)


def get_client_identifier(request: Request) -> str:
    """
    Get unique identifier for rate limiting

    Args:
        request: FastAPI request object

    Returns:
        Unique identifier string
    """
    # Try to get real IP from headers (for proxies)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip

    # Fallback to direct client IP
    return request.client.host if request.client else "unknown"


async def rate_limit_middleware(request: Request, call_next):
    """
    Rate limiting middleware

    Args:
        request: FastAPI request
        call_next: Next middleware/handler

    Returns:
        Response with rate limit headers
    """
    # Skip rate limiting for health checks and static files
    if request.url.path in ["/health", "/", "/docs", "/redoc", "/openapi.json"]:
        return await call_next(request)

    # Get client identifier
    client_id = get_client_identifier(request)

    # Check rate limit
    is_allowed, rate_info = rate_limiter.is_allowed(client_id)

    if not is_allowed:
        logger.warning(f"Rate limit exceeded for client {client_id}", extra={
            "client_id": client_id,
            "endpoint": request.url.path,
            "method": request.method,
            "rate_limit_info": rate_info
        })

        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": "RateLimitExceeded",
                "message": "Too many requests. Please try again later.",
                "retry_after": rate_info["retry_after"]
            },
            headers={
                "X-RateLimit-Limit": str(rate_info["limit"]),
                "X-RateLimit-Remaining": str(rate_info["remaining"]),
                "X-RateLimit-Reset": str(rate_info["reset_time"]),
                "Retry-After": str(rate_info["retry_after"])
            }
        )

    # Process request
    response = await call_next(request)

    # Add rate limit headers to response
    response.headers["X-RateLimit-Limit"] = str(rate_info["limit"])
    response.headers["X-RateLimit-Remaining"] = str(rate_info["remaining"])
    response.headers["X-RateLimit-Reset"] = str(rate_info["reset_time"])

    return response


class RateLimitConfig:
    """Configuration for different rate limits"""

    # Default rate limits
    DEFAULT = {"requests": 60, "window": 60}  # 60 requests per minute

    # Endpoint-specific rate limits
    ENDPOINTS = {
        "/data": {"requests": 30, "window": 60},  # More restrictive for data endpoint
        "/attendance": {"requests": 30, "window": 60},
        "/cgpa": {"requests": 20, "window": 60},
        "/auto-feedback": {"requests": 5, "window": 300},  # Very restrictive for feedback
    }

    @classmethod
    def get_limit_for_endpoint(cls, endpoint: str) -> Dict[str, int]:
        """Get rate limit configuration for specific endpoint"""
        return cls.ENDPOINTS.get(endpoint, cls.DEFAULT)
