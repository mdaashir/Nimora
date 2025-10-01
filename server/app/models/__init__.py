"""
Pydantic models for request/response data validation
"""
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field, validator, ConfigDict
from enum import Enum


class UserCredentials(BaseModel):
    """User login credentials"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )

    rollno: str = Field(..., min_length=6, max_length=20, description="Student roll number")
    password: str = Field(..., min_length=6, max_length=100, description="Student password")

    @validator('rollno')
    def validate_rollno(cls, v):
        if not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('Roll number contains invalid characters')
        return v.lower()


class PayloadRequest(BaseModel):
    """Request with encoded payload"""
    data: str = Field(..., description="Base64 encoded payload data")


class AttendanceRecord(BaseModel):
    """Individual attendance record for a course"""
    model_config = ConfigDict(use_enum_values=True)

    course_code: str = Field(..., description="Course code identifier")
    course_name: Optional[str] = Field(None, description="Full course name")
    total_classes: int = Field(..., ge=0, description="Total number of classes")
    present: int = Field(..., ge=0, description="Number of classes attended")
    absent: int = Field(..., ge=0, description="Number of classes missed")
    percentage: Union[str, float] = Field(..., description="Attendance percentage")

    @validator('percentage')
    def convert_percentage(cls, v):
        if isinstance(v, str):
            try:
                return float(v.replace('%', ''))
            except ValueError:
                return 0.0
        return v

    @validator('absent', always=True)
    def calculate_absent(cls, v, values):
        if 'total_classes' in values and 'present' in values:
            return values['total_classes'] - values['present']
        return v


class CGPARecord(BaseModel):
    """CGPA and semester data"""
    model_config = ConfigDict(use_enum_values=True)

    semester: str = Field(..., description="Semester identifier")
    gpa: float = Field(..., ge=0.0, le=10.0, description="GPA for the semester")
    credits: int = Field(..., ge=0, description="Credits for the semester")
    courses: List[str] = Field(default_factory=list, description="List of course codes")


class ExamRecord(BaseModel):
    """Exam schedule record"""
    model_config = ConfigDict(use_enum_values=True)

    course_code: str = Field(..., description="Course code")
    course_name: Optional[str] = Field(None, description="Course name")
    exam_date: Union[str, datetime] = Field(..., description="Exam date and time")
    duration: Optional[str] = Field(None, description="Exam duration")
    venue: Optional[str] = Field(None, description="Exam venue")

    class ExamPriority(str, Enum):
        URGENT = "urgent"
        SOON = "soon"
        UPCOMING = "upcoming"

    priority: Optional[ExamPriority] = Field(None, description="Exam priority based on date")


class InternalRecord(BaseModel):
    """Internal marks record"""
    model_config = ConfigDict(use_enum_values=True)

    course_code: str = Field(..., description="Course code")
    assessment_type: str = Field(..., description="Type of assessment")
    marks_obtained: Union[int, float] = Field(..., description="Marks obtained")
    total_marks: Union[int, float] = Field(..., description="Total marks")
    percentage: Optional[float] = Field(None, description="Percentage scored")

    @validator('percentage', always=True)
    def calculate_percentage(cls, v, values):
        if v is not None:
            return v
        if 'marks_obtained' in values and 'total_marks' in values and values['total_marks'] > 0:
            return round((values['marks_obtained'] / values['total_marks']) * 100, 2)
        return None


class UserInfo(BaseModel):
    """User information and profile data"""
    model_config = ConfigDict(use_enum_values=True)

    username: str = Field(..., description="Display name")
    roll_number: Optional[str] = Field(None, description="Roll number")
    is_birthday: bool = Field(default=False, description="Whether today is user's birthday")
    profile_data: Dict[str, Any] = Field(default_factory=dict, description="Additional profile information")


class FeedbackRequest(BaseModel):
    """Feedback submission request"""
    model_config = ConfigDict(use_enum_values=True)

    rollno: str = Field(..., min_length=6, max_length=20)
    password: str = Field(..., min_length=6, max_length=100)
    feedback_index: int = Field(default=0, ge=0, description="Feedback type index (0 for endsem)")


class CombinedDataResponse(BaseModel):
    """Combined response with all student data"""
    model_config = ConfigDict(use_enum_values=True)

    attendance: List[AttendanceRecord] = Field(default_factory=list)
    cgpa: List[CGPARecord] = Field(default_factory=list)
    timetable: List[ExamRecord] = Field(default_factory=list)
    internals: List[InternalRecord] = Field(default_factory=list)
    user_info: Optional[UserInfo] = Field(None)


class ApiResponse(BaseModel):
    """Standard API response format"""
    model_config = ConfigDict(use_enum_values=True)

    status: str = Field(..., description="Response status")
    message: str = Field(..., description="Response message")
    data: Optional[Union[CombinedDataResponse, List[Any], Dict[str, Any]]] = Field(None)
    request_id: Optional[str] = Field(None, description="Request correlation ID")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ErrorResponse(BaseModel):
    """Standard error response format"""
    model_config = ConfigDict(use_enum_values=True)

    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")
    request_id: Optional[str] = Field(None, description="Request correlation ID")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class HealthCheckResponse(BaseModel):
    """Health check response"""
    model_config = ConfigDict(use_enum_values=True)

    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    environment: str = Field(..., description="Deployment environment")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    uptime: Optional[float] = Field(None, description="Service uptime in seconds")
    checks: Dict[str, str] = Field(default_factory=dict, description="Individual health checks")
