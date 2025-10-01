"""
Attendance service with enhanced error handling and data processing
"""
from typing import List, Optional
from requests import Session

from app.services.base import BaseService
from app.models import AttendanceRecord
from app.core.exceptions import ScrapingError, DataProcessingError
from app.core.logging import log_function_call


class AttendanceService(BaseService):
    """Enhanced service for attendance data management"""

    @log_function_call
    async def get_attendance_data(self, session: Session) -> List[AttendanceRecord]:
        """
        Get structured attendance data for a student

        Args:
            session: Authenticated session

        Returns:
            List of attendance records

        Raises:
            ScrapingError: If scraping fails
            DataProcessingError: If data processing fails
        """
        self.log_operation("get_attendance_data")

        try:
            # Import here to avoid circular imports
            from util.Attendance import getStudentAttendance

            # Get raw attendance data
            raw_data = getStudentAttendance(session)

            if not raw_data:
                self.logger.warning("No attendance data found")
                return []

            # Process and validate data
            attendance_records = []
            for row in raw_data:
                try:
                    record = self._process_attendance_row(row)
                    attendance_records.append(record)
                except Exception as e:
                    self.logger.warning(f"Failed to process attendance row: {str(e)}", extra={"row": str(row)})
                    continue

            self.log_operation("get_attendance_data_completed", records_count=len(attendance_records))
            return attendance_records

        except Exception as e:
            self.handle_error(e, "get_attendance_data")
            if "scraping" in str(e).lower() or "parse" in str(e).lower():
                raise ScrapingError(f"Failed to scrape attendance data: {str(e)}")
            else:
                raise DataProcessingError(f"Failed to process attendance data: {str(e)}")

    def _process_attendance_row(self, row: List[str]) -> AttendanceRecord:
        """
        Process a single attendance row into structured data

        Args:
            row: Raw attendance data row

        Returns:
            AttendanceRecord instance
        """
        try:
            # Extract course code and name
            course_info = row[0].split('   -   ') if '   -   ' in row[0] else [row[0], '']
            course_code = course_info[0].strip()
            course_name = course_info[1].strip() if len(course_info) > 1 else None

            # Extract numeric values
            total_classes = int(row[1]) if len(row) > 1 else 0
            present = int(row[4]) if len(row) > 4 else 0
            absent = total_classes - present

            # Extract percentage
            percentage_str = row[6] if len(row) > 6 else row[5] if len(row) > 5 else "0"

            return AttendanceRecord(
                course_code=course_code,
                course_name=course_name,
                total_classes=total_classes,
                present=present,
                absent=absent,
                percentage=percentage_str
            )

        except (ValueError, IndexError) as e:
            raise DataProcessingError(f"Invalid attendance row format: {str(e)}")

    @log_function_call
    async def calculate_affordable_leaves(
        self,
        attendance_records: List[AttendanceRecord],
        target_percentage: float = 75.0
    ) -> List[dict]:
        """
        Calculate affordable leaves for each course

        Args:
            attendance_records: List of attendance records
            target_percentage: Target attendance percentage

        Returns:
            List of records with affordable leaves calculation
        """
        self.log_operation("calculate_affordable_leaves", target_percentage=target_percentage)

        results = []
        for record in attendance_records:
            try:
                affordable_leaves = self._calculate_leaves_for_course(
                    record.present,
                    record.total_classes,
                    target_percentage
                )

                results.append({
                    **record.model_dump(),
                    "affordable_leaves": affordable_leaves,
                    "target_percentage": target_percentage
                })

            except Exception as e:
                self.logger.warning(f"Failed to calculate leaves for {record.course_code}: {str(e)}")
                results.append({
                    **record.model_dump(),
                    "affordable_leaves": 0,
                    "target_percentage": target_percentage
                })

        return results

    def _calculate_leaves_for_course(
        self,
        classes_present: int,
        classes_total: int,
        maintenance_percentage: float
    ) -> int:
        """
        Calculate affordable leaves for a single course

        Args:
            classes_present: Number of classes attended
            classes_total: Total number of classes
            maintenance_percentage: Target attendance percentage

        Returns:
            Number of affordable leaves (negative means classes must be attended)
        """
        if classes_total == 0:
            return 0

        current_percentage = (classes_present / classes_total) * 100
        affordable_leaves = 0
        i = 1
        MAX_ITERATIONS = 1000  # Safety limit

        # Special case for 100% attendance target
        if maintenance_percentage == 100:
            return 0 if current_percentage == 100 else -(classes_total - classes_present)

        if current_percentage < maintenance_percentage:
            # Need to attend more classes
            iterations = 0
            while (((classes_present + i) / (classes_total + i)) * 100 <= maintenance_percentage and
                   iterations < MAX_ITERATIONS):
                affordable_leaves -= 1
                i += 1
                iterations += 1
        else:
            # Can skip some classes
            iterations = 0
            while ((classes_present / (classes_total + i)) * 100 >= maintenance_percentage and
                   iterations < MAX_ITERATIONS):
                affordable_leaves += 1
                i += 1
                iterations += 1

        return affordable_leaves
