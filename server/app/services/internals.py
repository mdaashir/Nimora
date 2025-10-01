"""
Internals service with enhanced error handling and data processing
"""
from typing import List, Optional
from requests import Session

from app.services.base import BaseService
from app.models import InternalRecord
from app.core.exceptions import ScrapingError, DataProcessingError
from app.core.logging import log_function_call


class InternalsService(BaseService):
    """Enhanced service for internal marks management"""

    @log_function_call
    async def get_internals_data(self, session: Session) -> List[InternalRecord]:
        """
        Get structured internal marks data for a student

        Args:
            session: Authenticated session

        Returns:
            List of internal records

        Raises:
            ScrapingError: If scraping fails
            DataProcessingError: If data processing fails
        """
        self.log_operation("get_internals_data")

        try:
            # Import here to avoid circular imports
            from util.Internals import getInternals

            # Get internal marks data
            internals_data = getInternals(session)

            if not internals_data:
                self.logger.warning("No internal marks data found")
                return []

            # Process and validate data
            internal_records = []

            # Handle different data formats
            if isinstance(internals_data, list):
                for internal_info in internals_data:
                    try:
                        record = self._process_internal_record(internal_info)
                        if record:
                            internal_records.append(record)
                    except Exception as e:
                        self.logger.warning(f"Failed to process internal record: {str(e)}", extra={"record": str(internal_info)})
                        continue
            elif isinstance(internals_data, dict):
                # Handle dictionary format
                for course_code, assessments in internals_data.items():
                    if isinstance(assessments, list):
                        for assessment in assessments:
                            try:
                                record = self._process_internal_record({
                                    "course_code": course_code,
                                    **assessment
                                })
                                if record:
                                    internal_records.append(record)
                            except Exception as e:
                                self.logger.warning(f"Failed to process assessment: {str(e)}")
                                continue

            self.log_operation("get_internals_data_completed", records_count=len(internal_records))
            return internal_records

        except Exception as e:
            self.handle_error(e, "get_internals_data")
            if "scraping" in str(e).lower() or "parse" in str(e).lower():
                raise ScrapingError(f"Failed to scrape internal marks: {str(e)}")
            else:
                raise DataProcessingError(f"Failed to process internal marks: {str(e)}")

    def _process_internal_record(self, internal_info: dict) -> Optional[InternalRecord]:
        """
        Process a single internal record into structured data

        Args:
            internal_info: Raw internal marks data

        Returns:
            InternalRecord instance or None if invalid
        """
        try:
            # Extract course information
            course_code = str(internal_info.get('course_code', internal_info.get('Course Code',
                                                internal_info.get('Subject Code', ''))))

            if not course_code:
                return None

            # Extract assessment information
            assessment_type = str(internal_info.get('assessment_type',
                                                  internal_info.get('Assessment Type',
                                                  internal_info.get('Exam Type',
                                                  internal_info.get('Type', 'Unknown')))))

            # Extract marks
            marks_obtained = self._parse_numeric_value(
                internal_info.get('marks_obtained',
                internal_info.get('Marks Obtained',
                internal_info.get('Marks',
                internal_info.get('Score', 0)))))

            total_marks = self._parse_numeric_value(
                internal_info.get('total_marks',
                internal_info.get('Total Marks',
                internal_info.get('Max Marks',
                internal_info.get('Maximum', 100)))))

            return InternalRecord(
                course_code=course_code,
                assessment_type=assessment_type,
                marks_obtained=marks_obtained,
                total_marks=total_marks
            )

        except Exception as e:
            raise DataProcessingError(f"Invalid internal record format: {str(e)}")

    def _parse_numeric_value(self, value) -> float:
        """
        Parse numeric value from various formats

        Args:
            value: Value to parse

        Returns:
            Parsed numeric value
        """
        if value is None:
            return 0.0

        try:
            # Handle string values
            if isinstance(value, str):
                # Remove common non-numeric characters
                cleaned = value.replace('%', '').replace(',', '').strip()

                # Handle fractions like "85/100"
                if '/' in cleaned:
                    parts = cleaned.split('/')
                    if len(parts) == 2:
                        return float(parts[0]) / float(parts[1]) * 100

                # Handle ranges like "80-85"
                if '-' in cleaned and cleaned.count('-') == 1:
                    parts = cleaned.split('-')
                    if len(parts) == 2:
                        return (float(parts[0]) + float(parts[1])) / 2

                return float(cleaned)

            return float(value)

        except (ValueError, ZeroDivisionError):
            return 0.0

    @log_function_call
    async def calculate_course_internals(self, internal_records: List[InternalRecord]) -> dict:
        """
        Calculate internal marks statistics by course

        Args:
            internal_records: List of internal records

        Returns:
            Dictionary with course-wise internal statistics
        """
        self.log_operation("calculate_course_internals", records_count=len(internal_records))

        if not internal_records:
            return {}

        course_stats = {}

        for record in internal_records:
            course_code = record.course_code

            if course_code not in course_stats:
                course_stats[course_code] = {
                    "assessments": [],
                    "total_marks": 0,
                    "obtained_marks": 0,
                    "average_percentage": 0,
                    "assessment_count": 0
                }

            course_stats[course_code]["assessments"].append({
                "type": record.assessment_type,
                "marks": record.marks_obtained,
                "total": record.total_marks,
                "percentage": record.percentage
            })

            course_stats[course_code]["total_marks"] += record.total_marks
            course_stats[course_code]["obtained_marks"] += record.marks_obtained
            course_stats[course_code]["assessment_count"] += 1

        # Calculate averages
        for course_code, stats in course_stats.items():
            if stats["total_marks"] > 0:
                stats["average_percentage"] = round(
                    (stats["obtained_marks"] / stats["total_marks"]) * 100, 2
                )

        return course_stats

    @log_function_call
    async def get_performance_insights(self, internal_records: List[InternalRecord]) -> dict:
        """
        Generate performance insights from internal marks

        Args:
            internal_records: List of internal records

        Returns:
            Dictionary with performance insights
        """
        self.log_operation("get_performance_insights", records_count=len(internal_records))

        if not internal_records:
            return {
                "total_assessments": 0,
                "average_score": 0,
                "best_performance": None,
                "needs_improvement": [],
                "strong_subjects": []
            }

        try:
            # Calculate overall statistics
            total_assessments = len(internal_records)
            total_percentage = sum(record.percentage or 0 for record in internal_records)
            average_score = round(total_percentage / total_assessments, 2) if total_assessments > 0 else 0

            # Find best performance
            best_record = max(internal_records, key=lambda x: x.percentage or 0)

            # Group by course for analysis
            course_performance = {}
            for record in internal_records:
                course = record.course_code
                if course not in course_performance:
                    course_performance[course] = []
                course_performance[course].append(record.percentage or 0)

            # Calculate course averages
            course_averages = {
                course: sum(scores) / len(scores)
                for course, scores in course_performance.items()
            }

            # Identify strong subjects (>80%) and needs improvement (<60%)
            strong_subjects = [course for course, avg in course_averages.items() if avg > 80]
            needs_improvement = [course for course, avg in course_averages.items() if avg < 60]

            return {
                "total_assessments": total_assessments,
                "average_score": average_score,
                "best_performance": {
                    "course": best_record.course_code,
                    "assessment": best_record.assessment_type,
                    "percentage": best_record.percentage
                },
                "needs_improvement": needs_improvement,
                "strong_subjects": strong_subjects,
                "course_averages": course_averages
            }

        except Exception as e:
            self.logger.error(f"Failed to calculate performance insights: {str(e)}")
            return {
                "total_assessments": len(internal_records),
                "average_score": 0,
                "best_performance": None,
                "needs_improvement": [],
                "strong_subjects": []
            }
