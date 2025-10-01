"""
CGPA service with enhanced error handling and data processing
"""
from typing import List, Optional
from requests import Session
import pandas as pd

from app.services.base import BaseService
from app.models import CGPARecord
from app.core.exceptions import ScrapingError, DataProcessingError
from app.core.logging import log_function_call


class CGPAService(BaseService):
    """Enhanced service for CGPA data management"""

    @log_function_call
    async def get_cgpa_data(self, session: Session) -> List[CGPARecord]:
        """
        Get structured CGPA data for a student

        Args:
            session: Authenticated session

        Returns:
            List of CGPA records

        Raises:
            ScrapingError: If scraping fails
            DataProcessingError: If data processing fails
        """
        self.log_operation("get_cgpa_data")

        try:
            # Import here to avoid circular imports
            from util.Cgpa import getStudentCourses, getCompletedSemester, getCGPA

            # Get course data and completed semester
            course_data = getStudentCourses(session)
            completed_semester = getCompletedSemester(session)

            if not course_data or course_data.empty:
                self.logger.warning("No course data found")
                return []

            # Calculate CGPA
            cgpa_data = getCGPA(course_data, completed_semester)

            if cgpa_data.empty:
                self.logger.warning("No CGPA data calculated")
                return []

            # Process and validate data
            cgpa_records = []
            for _, row in cgpa_data.iterrows():
                try:
                    record = self._process_cgpa_row(row)
                    cgpa_records.append(record)
                except Exception as e:
                    self.logger.warning(f"Failed to process CGPA row: {str(e)}", extra={"row": str(row)})
                    continue

            self.log_operation("get_cgpa_data_completed", records_count=len(cgpa_records))
            return cgpa_records

        except Exception as e:
            self.handle_error(e, "get_cgpa_data")
            if "No completed courses found" in str(e) or "Could not find completed courses data" in str(e):
                # Return empty array for new students
                return []
            if "scraping" in str(e).lower() or "parse" in str(e).lower():
                raise ScrapingError(f"Failed to scrape CGPA data: {str(e)}")
            else:
                raise DataProcessingError(f"Failed to process CGPA data: {str(e)}")

    def _process_cgpa_row(self, row: pd.Series) -> CGPARecord:
        """
        Process a single CGPA row into structured data

        Args:
            row: Raw CGPA data row

        Returns:
            CGPARecord instance
        """
        try:
            # Extract values with fallbacks
            semester = str(row.get('Semester', row.name if hasattr(row, 'name') else 'Unknown'))
            gpa = float(row.get('GPA', row.get('SGPA', 0.0)))
            credits = int(row.get('Credits', row.get('Total Credits', 0)))

            # Extract courses if available
            courses = []
            if hasattr(row, 'Courses') and row['Courses']:
                if isinstance(row['Courses'], str):
                    courses = [course.strip() for course in row['Courses'].split(',')]
                elif isinstance(row['Courses'], list):
                    courses = row['Courses']

            return CGPARecord(
                semester=semester,
                gpa=gpa,
                credits=credits,
                courses=courses
            )

        except (ValueError, KeyError) as e:
            raise DataProcessingError(f"Invalid CGPA row format: {str(e)}")

    @log_function_call
    async def calculate_overall_cgpa(self, cgpa_records: List[CGPARecord]) -> dict:
        """
        Calculate overall CGPA from semester records

        Args:
            cgpa_records: List of CGPA records

        Returns:
            Dictionary with overall CGPA calculations
        """
        self.log_operation("calculate_overall_cgpa", records_count=len(cgpa_records))

        if not cgpa_records:
            return {
                "overall_cgpa": 0.0,
                "total_credits": 0,
                "completed_semesters": 0,
                "average_gpa": 0.0
            }

        try:
            total_weighted_points = 0.0
            total_credits = 0
            total_gpa_sum = 0.0

            for record in cgpa_records:
                if record.credits > 0 and record.gpa > 0:
                    total_weighted_points += record.gpa * record.credits
                    total_credits += record.credits
                    total_gpa_sum += record.gpa

            overall_cgpa = total_weighted_points / total_credits if total_credits > 0 else 0.0
            average_gpa = total_gpa_sum / len(cgpa_records)

            return {
                "overall_cgpa": round(overall_cgpa, 2),
                "total_credits": total_credits,
                "completed_semesters": len(cgpa_records),
                "average_gpa": round(average_gpa, 2),
                "highest_gpa": max(record.gpa for record in cgpa_records),
                "lowest_gpa": min(record.gpa for record in cgpa_records)
            }

        except Exception as e:
            self.logger.error(f"Failed to calculate overall CGPA: {str(e)}")
            return {
                "overall_cgpa": 0.0,
                "total_credits": 0,
                "completed_semesters": len(cgpa_records),
                "average_gpa": 0.0
            }
