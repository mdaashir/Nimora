"""
Timetable service with enhanced error handling and data processing
"""
from typing import List, Optional
from requests import Session
import pandas as pd
from datetime import datetime, timedelta

from app.services.base import BaseService
from app.models import ExamRecord
from app.core.exceptions import ScrapingError, DataProcessingError
from app.core.logging import log_function_call


class TimetableService(BaseService):
    """Enhanced service for exam timetable management"""

    @log_function_call
    async def get_exam_schedule(self, session: Session) -> List[ExamRecord]:
        """
        Get structured exam schedule data for a student

        Args:
            session: Authenticated session

        Returns:
            List of exam records

        Raises:
            ScrapingError: If scraping fails
            DataProcessingError: If data processing fails
        """
        self.log_operation("get_exam_schedule")

        try:
            # Import here to avoid circular imports
            from util.Timetable import getExamSchedule

            # Get exam schedule data
            schedule_data = getExamSchedule(session)

            # Handle different return types
            if schedule_data is None:
                self.logger.warning("No exam schedule data found")
                return []

            if isinstance(schedule_data, pd.DataFrame):
                if schedule_data.empty:
                    self.logger.warning("Empty exam schedule DataFrame")
                    return []
                exam_data = schedule_data.to_dict(orient='records')
            elif isinstance(schedule_data, list):
                exam_data = schedule_data
            else:
                self.logger.warning(f"Unexpected schedule data type: {type(schedule_data)}")
                return []

            # Process and validate data
            exam_records = []
            for exam_info in exam_data:
                try:
                    record = self._process_exam_record(exam_info)
                    if record:
                        exam_records.append(record)
                except Exception as e:
                    self.logger.warning(f"Failed to process exam record: {str(e)}", extra={"record": str(exam_info)})
                    continue

            # Sort by exam date
            exam_records.sort(key=lambda x: self._parse_exam_date(x.exam_date))

            self.log_operation("get_exam_schedule_completed", records_count=len(exam_records))
            return exam_records

        except Exception as e:
            self.handle_error(e, "get_exam_schedule")
            if "scraping" in str(e).lower() or "parse" in str(e).lower():
                raise ScrapingError(f"Failed to scrape exam schedule: {str(e)}")
            else:
                raise DataProcessingError(f"Failed to process exam schedule: {str(e)}")

    def _process_exam_record(self, exam_info: dict) -> Optional[ExamRecord]:
        """
        Process a single exam record into structured data

        Args:
            exam_info: Raw exam data

        Returns:
            ExamRecord instance or None if invalid
        """
        try:
            # Extract course information
            course_code = str(exam_info.get('course_code', exam_info.get('Course Code', exam_info.get('Subject Code', ''))))
            course_name = str(exam_info.get('course_name', exam_info.get('Course Name', exam_info.get('Subject Name', ''))))

            if not course_code:
                return None

            # Extract exam details
            exam_date = exam_info.get('exam_date', exam_info.get('Date', exam_info.get('Exam Date', '')))
            duration = exam_info.get('duration', exam_info.get('Duration', exam_info.get('Time', '')))
            venue = exam_info.get('venue', exam_info.get('Venue', exam_info.get('Hall', '')))

            # Calculate priority based on exam date
            priority = self._calculate_exam_priority(exam_date)

            return ExamRecord(
                course_code=course_code,
                course_name=course_name if course_name else None,
                exam_date=exam_date,
                duration=str(duration) if duration else None,
                venue=str(venue) if venue else None,
                priority=priority
            )

        except Exception as e:
            raise DataProcessingError(f"Invalid exam record format: {str(e)}")

    def _parse_exam_date(self, exam_date: str) -> datetime:
        """
        Parse exam date string into datetime object

        Args:
            exam_date: Date string in various formats

        Returns:
            Parsed datetime object
        """
        if isinstance(exam_date, datetime):
            return exam_date

        # Common date formats to try
        date_formats = [
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d",
            "%d/%m/%Y %H:%M",
            "%d/%m/%Y",
            "%d-%m-%Y %H:%M",
            "%d-%m-%Y",
            "%Y/%m/%d %H:%M",
            "%Y/%m/%d"
        ]

        for fmt in date_formats:
            try:
                return datetime.strptime(str(exam_date), fmt)
            except ValueError:
                continue

        # If no format matches, return a far future date
        self.logger.warning(f"Could not parse exam date: {exam_date}")
        return datetime.now() + timedelta(days=365)

    def _calculate_exam_priority(self, exam_date: str) -> Optional[ExamRecord.ExamPriority]:
        """
        Calculate exam priority based on date

        Args:
            exam_date: Exam date string

        Returns:
            ExamPriority enum value
        """
        try:
            exam_datetime = self._parse_exam_date(exam_date)
            now = datetime.now()
            days_until_exam = (exam_datetime - now).days

            if days_until_exam < 0:
                return None  # Past exam
            elif days_until_exam <= 3:
                return ExamRecord.ExamPriority.URGENT
            elif days_until_exam <= 7:
                return ExamRecord.ExamPriority.SOON
            else:
                return ExamRecord.ExamPriority.UPCOMING

        except Exception:
            return ExamRecord.ExamPriority.UPCOMING

    @log_function_call
    async def get_upcoming_exams(self, exam_records: List[ExamRecord], days_ahead: int = 30) -> List[ExamRecord]:
        """
        Filter exams for upcoming dates

        Args:
            exam_records: List of exam records
            days_ahead: Number of days to look ahead

        Returns:
            List of upcoming exam records
        """
        self.log_operation("get_upcoming_exams", days_ahead=days_ahead)

        cutoff_date = datetime.now() + timedelta(days=days_ahead)
        upcoming_exams = []

        for exam in exam_records:
            try:
                exam_date = self._parse_exam_date(exam.exam_date)
                if datetime.now() <= exam_date <= cutoff_date:
                    upcoming_exams.append(exam)
            except Exception as e:
                self.logger.warning(f"Failed to process exam date for {exam.course_code}: {str(e)}")
                continue

        return upcoming_exams

    @log_function_call
    async def get_exam_statistics(self, exam_records: List[ExamRecord]) -> dict:
        """
        Generate exam statistics

        Args:
            exam_records: List of exam records

        Returns:
            Dictionary with exam statistics
        """
        self.log_operation("get_exam_statistics", records_count=len(exam_records))

        if not exam_records:
            return {
                "total_exams": 0,
                "urgent_exams": 0,
                "soon_exams": 0,
                "upcoming_exams": 0,
                "next_exam": None
            }

        try:
            urgent_count = sum(1 for exam in exam_records if exam.priority == ExamRecord.ExamPriority.URGENT)
            soon_count = sum(1 for exam in exam_records if exam.priority == ExamRecord.ExamPriority.SOON)
            upcoming_count = sum(1 for exam in exam_records if exam.priority == ExamRecord.ExamPriority.UPCOMING)

            # Find next exam
            future_exams = [exam for exam in exam_records if self._parse_exam_date(exam.exam_date) > datetime.now()]
            next_exam = min(future_exams, key=lambda x: self._parse_exam_date(x.exam_date)) if future_exams else None

            return {
                "total_exams": len(exam_records),
                "urgent_exams": urgent_count,
                "soon_exams": soon_count,
                "upcoming_exams": upcoming_count,
                "next_exam": next_exam.model_dump() if next_exam else None
            }

        except Exception as e:
            self.logger.error(f"Failed to calculate exam statistics: {str(e)}")
            return {
                "total_exams": len(exam_records),
                "urgent_exams": 0,
                "soon_exams": 0,
                "upcoming_exams": 0,
                "next_exam": None
            }
