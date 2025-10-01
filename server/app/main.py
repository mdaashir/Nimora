"""
Modern FastAPI application with improved architecture
"""
import time
import uuid
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, Request, Response, Depends, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.logging import get_logger, request_id_var, log_api_call
from app.core.cache import cache_manager, cache_key_for_user_data
from app.core.exceptions import (
    NimoraException,
    EXCEPTION_STATUS_MAP,
    create_http_exception,
    AuthenticationError,
    ValidationError
)
from app.core.security import PayloadSecurity, CredentialValidator, generate_request_id
from app.models import (
    UserCredentials,
    PayloadRequest,
    ApiResponse,
    ErrorResponse,
    HealthCheckResponse,
    CombinedDataResponse
)
from app.services.base import AuthenticationService
from app.services.attendance import AttendanceService
from app.services.cgpa import CGPAService
from app.services.timetable import TimetableService
from app.services.internals import InternalsService
from app.services.user_info import UserInfoService
from app.middleware.rate_limit import rate_limit_middleware

# Initialize logger
logger = get_logger(__name__)

# Application startup time for uptime calculation
app_start_time = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager"""
    logger.info("Starting Nimora API Server", extra={
        "version": settings.app_version,
        "environment": settings.environment
    })
    yield
    logger.info("Shutting down Nimora API Server")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Modern student management system API with enhanced security and monitoring",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# Add middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware
app.middleware("http")(rate_limit_middleware)


# Request middleware for logging and correlation ID
@app.middleware("http")
async def request_middleware(request: Request, call_next):
    """Add request correlation ID and logging"""
    # Generate unique request ID
    request_id = generate_request_id()
    request_id_var.set(request_id)

    # Add request ID to headers
    request.state.request_id = request_id

    # Log incoming request
    start_time = time.time()

    try:
        # Process request
        response = await call_next(request)

        # Calculate duration
        duration = time.time() - start_time

        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id

        # Log API call
        log_api_call(
            endpoint=request.url.path,
            method=request.method,
            status_code=response.status_code,
            duration=duration
        )

        return response

    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Unhandled request error: {str(e)}", extra={
            "endpoint": request.url.path,
            "method": request.method,
            "duration": duration
        }, exc_info=True)
        raise


# Exception handlers
@app.exception_handler(NimoraException)
async def nimora_exception_handler(request: Request, exc: NimoraException):
    """Handle custom Nimora exceptions"""
    status_code = EXCEPTION_STATUS_MAP.get(type(exc), 500)

    error_response = ErrorResponse(
        error=exc.__class__.__name__,
        message=exc.message,
        details=exc.details,
        request_id=getattr(request.state, 'request_id', None)
    )

    return JSONResponse(
        status_code=status_code,
        content=error_response.model_dump()
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors"""
    error_response = ErrorResponse(
        error="ValidationError",
        message="Request validation failed",
        details={
            "errors": exc.errors(),
            "body": exc.body
        },
        request_id=getattr(request.state, 'request_id', None)
    )

    return JSONResponse(
        status_code=422,
        content=error_response.model_dump()
    )


@app.exception_handler(500)
async def internal_server_error_handler(request: Request, exc: Exception):
    """Handle internal server errors"""
    logger.error(f"Internal server error: {str(exc)}", exc_info=True)

    error_response = ErrorResponse(
        error="InternalServerError",
        message="An unexpected error occurred",
        details={"error_type": exc.__class__.__name__} if settings.debug else {},
        request_id=getattr(request.state, 'request_id', None)
    )

    return JSONResponse(
        status_code=500,
        content=error_response.model_dump()
    )


# Dependency injection helpers
def get_auth_service() -> AuthenticationService:
    """Get authentication service instance"""
    return AuthenticationService()


def get_attendance_service() -> AttendanceService:
    """Get attendance service instance"""
    return AttendanceService()


def get_cgpa_service() -> CGPAService:
    """Get CGPA service instance"""
    return CGPAService()


def get_timetable_service() -> TimetableService:
    """Get timetable service instance"""
    return TimetableService()


def get_internals_service() -> InternalsService:
    """Get internals service instance"""
    return InternalsService()


def get_user_info_service() -> UserInfoService:
    """Get user info service instance"""
    return UserInfoService()


def extract_credentials_from_request(request: Dict[str, Any]) -> UserCredentials:
    """Extract and validate credentials from request"""
    try:
        if 'data' in request:
            # Decode payload
            decoded_data = PayloadSecurity.decode_payload(request['data'])
            rollno = decoded_data.get('rollno')
            password = decoded_data.get('password')
        else:
            # Direct format (backward compatibility)
            rollno = request.get('rollno')
            password = request.get('password')

        if not rollno or not password:
            raise ValidationError("Missing credentials")

        # Validate credentials
        rollno = CredentialValidator.validate_roll_number(rollno)
        CredentialValidator.validate_password(password)

        return UserCredentials(rollno=rollno, password=password)

    except ValidationError:
        raise
    except Exception as e:
        raise ValidationError(f"Invalid request format: {str(e)}")


# API Routes
@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint with basic API information"""
    return {
        "message": f"{settings.app_name} v{settings.app_version}",
        "status": "running",
        "docs": "/docs" if settings.debug else "disabled",
        "environment": settings.environment
    }


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint for monitoring"""
    uptime = time.time() - app_start_time

    # Basic health checks
    checks = {
        "database": "ok",  # Add actual DB check when implemented
        "external_services": "ok",  # Add external service checks
        "memory": "ok"  # Add memory usage check
    }

    return HealthCheckResponse(
        status="healthy",
        version=settings.app_version,
        environment=settings.environment,
        uptime=uptime,
        checks=checks
    )


@app.post("/data", response_model=ApiResponse)
async def get_combined_data(
    request: Dict[str, Any],
    auth_service: AuthenticationService = Depends(get_auth_service),
    attendance_service: AttendanceService = Depends(get_attendance_service),
    cgpa_service: CGPAService = Depends(get_cgpa_service),
    timetable_service: TimetableService = Depends(get_timetable_service),
    internals_service: InternalsService = Depends(get_internals_service),
    user_info_service: UserInfoService = Depends(get_user_info_service)
):
    """
    Get combined student data (attendance, CGPA, timetable, internals, user info)
    """
    # Extract and validate credentials
    credentials = extract_credentials_from_request(request)

    logger.info("Processing combined data request", extra={
        "rollno": credentials.rollno
    })

    # Try to get data from cache first
    cache_key = cache_key_for_user_data(credentials.rollno, "combined_data")

    try:
        # Check cache first
        cached_data = await cache_manager.get(cache_key)
        if cached_data:
            logger.info("Returning cached combined data", extra={"rollno": credentials.rollno})
            return ApiResponse(
                status="success",
                message="Combined data retrieved from cache",
                data=cached_data,
                request_id=request_id_var.get()
            )

        # Create authenticated sessions
        attendance_session = await auth_service.create_session(
            credentials.rollno,
            credentials.password,
            "attendance"
        )

        cgpa_session = await auth_service.create_session(
            credentials.rollno,
            credentials.password,
            "cgpa"
        )

        # Get all data concurrently
        import asyncio

        attendance_task = attendance_service.get_attendance_data(attendance_session)
        cgpa_task = cgpa_service.get_cgpa_data(cgpa_session)
        timetable_task = timetable_service.get_exam_schedule(attendance_session)
        internals_task = internals_service.get_internals_data(attendance_session)
        user_info_task = user_info_service.get_user_info(attendance_session, credentials.rollno)

        # Execute all tasks concurrently
        attendance_records, cgpa_records, timetable_records, internals_records, user_info = await asyncio.gather(
            attendance_task,
            cgpa_task,
            timetable_task,
            internals_task,
            user_info_task,
            return_exceptions=True
        )

        # Handle exceptions gracefully
        if isinstance(attendance_records, Exception):
            logger.warning(f"Attendance service failed: {str(attendance_records)}")
            attendance_records = []

        if isinstance(cgpa_records, Exception):
            logger.warning(f"CGPA service failed: {str(cgpa_records)}")
            cgpa_records = []

        if isinstance(timetable_records, Exception):
            logger.warning(f"Timetable service failed: {str(timetable_records)}")
            timetable_records = []

        if isinstance(internals_records, Exception):
            logger.warning(f"Internals service failed: {str(internals_records)}")
            internals_records = []

        if isinstance(user_info, Exception):
            logger.warning(f"User info service failed: {str(user_info)}")
            user_info = None

        combined_data = CombinedDataResponse(
            attendance=attendance_records,
            cgpa=cgpa_records,
            timetable=timetable_records,
            internals=internals_records,
            user_info=user_info
        )

        # Cache the result for future requests
        await cache_manager.set(cache_key, combined_data.model_dump(), ttl=300)  # 5 minutes cache

        return ApiResponse(
            status="success",
            message="Combined data retrieved successfully",
            data=combined_data,
            request_id=request_id_var.get()
        )

    except NimoraException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in combined data endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to retrieve data")


@app.post("/attendance", response_model=ApiResponse)
async def get_attendance(
    request: Dict[str, Any],
    auth_service: AuthenticationService = Depends(get_auth_service),
    attendance_service: AttendanceService = Depends(get_attendance_service)
):
    """Get detailed attendance data"""
    credentials = extract_credentials_from_request(request)

    logger.info("Processing attendance request", extra={
        "rollno": credentials.rollno
    })

    try:
        # Create session and get data
        session = await auth_service.create_session(
            credentials.rollno,
            credentials.password,
            "attendance"
        )

        attendance_records = await attendance_service.get_attendance_data(session)

        return ApiResponse(
            status="success",
            message="Attendance data retrieved successfully",
            data=attendance_records,
            request_id=request_id_var.get()
        )

    except NimoraException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in attendance endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to retrieve attendance data")


# Legacy endpoints for backward compatibility
@app.post("/login")
async def login_legacy(request: Dict[str, Any]):
    """
    DEPRECATED: Use /data endpoint instead
    Maintained for backward compatibility
    """
    logger.warning("Deprecated /login endpoint used", extra={
        "deprecation": "Use /data endpoint instead"
    })

    # Delegate to new endpoint
    response = await get_combined_data(request)
    response.message += " (DEPRECATED: Use /data endpoint)"

    return response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
