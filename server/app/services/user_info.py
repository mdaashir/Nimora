"""
User Info service with enhanced error handling and data processing
"""
from typing import Optional, Dict, Any
from requests import Session
from datetime import datetime
import pytz
from bs4 import BeautifulSoup

from app.services.base import BaseService
from app.models import UserInfo
from app.core.exceptions import ScrapingError, DataProcessingError
from app.core.logging import log_function_call


class UserInfoService(BaseService):
    """Enhanced service for user information management"""

    @log_function_call
    async def get_user_info(self, session: Session, rollno: str) -> UserInfo:
        """
        Get structured user information for a student

        Args:
            session: Authenticated session
            rollno: Student roll number

        Returns:
            UserInfo instance

        Raises:
            ScrapingError: If scraping fails
            DataProcessingError: If data processing fails
        """
        self.log_operation("get_user_info", rollno=rollno)

        try:
            # Initialize default response
            user_data = {
                "username": rollno,
                "roll_number": rollno,
                "is_birthday": False,
                "profile_data": {}
            }

            # Try multiple pages to get user info
            pages_to_try = [
                {
                    "url": "https://ecampus.psgtech.ac.in/studzone/Scholar/VallalarScholarship",
                    "type": "scholarship"
                },
                {
                    "url": "https://ecampus.psgtech.ac.in/studzone/Profile",
                    "type": "profile"
                }
            ]

            for page_info in pages_to_try:
                try:
                    await self._extract_user_info_from_page(
                        session, page_info["url"], page_info["type"], user_data
                    )

                    # If we got a username that's not the roll number, we can break
                    if user_data["username"] != rollno:
                        break

                except Exception as e:
                    self.logger.warning(f"Failed to extract from {page_info['type']} page: {str(e)}")
                    continue

            self.log_operation("get_user_info_completed", username=user_data["username"])

            return UserInfo(
                username=user_data["username"],
                roll_number=user_data["roll_number"],
                is_birthday=user_data["is_birthday"],
                profile_data=user_data["profile_data"]
            )

        except Exception as e:
            self.handle_error(e, "get_user_info", rollno=rollno)
            # Return default user info on error instead of raising exception
            return UserInfo(
                username=rollno,
                roll_number=rollno,
                is_birthday=False,
                profile_data={}
            )

    async def _extract_user_info_from_page(
        self,
        session: Session,
        page_url: str,
        page_type: str,
        user_data: Dict[str, Any]
    ) -> None:
        """
        Extract user information from a specific page

        Args:
            session: Authenticated session
            page_url: URL to scrape
            page_type: Type of page (scholarship, profile)
            user_data: Dictionary to update with extracted data
        """
        try:
            page_response = session.get(page_url, timeout=10)

            if not page_response.ok:
                self.logger.warning(f"Failed to load {page_type} page: {page_response.status_code}")
                return

            page_soup = BeautifulSoup(page_response.text, "html.parser")

            if page_type == "scholarship":
                await self._extract_from_scholarship_page(page_soup, user_data)
            elif page_type == "profile":
                await self._extract_from_profile_page(page_soup, user_data)

        except Exception as e:
            self.logger.warning(f"Error extracting from {page_type} page: {str(e)}")
            raise

    async def _extract_from_scholarship_page(self, soup: BeautifulSoup, user_data: Dict[str, Any]) -> None:
        """
        Extract user information from scholarship page

        Args:
            soup: BeautifulSoup object of the page
            user_data: Dictionary to update with extracted data
        """
        try:
            personal_info_table = soup.find("td", {"class": "personal-info"})
            if personal_info_table:
                personal_info = personal_info_table.find_all("td")

                # Get username (first item in personal info)
                if personal_info and len(personal_info) > 0:
                    username = personal_info[0].get_text(strip=True)
                    if username and len(username) > 0:
                        user_data["username"] = username
                        user_data["profile_data"]["full_name"] = username

                # Get birthday (third item in personal info)
                if personal_info and len(personal_info) > 2:
                    try:
                        birthdate_str = personal_info[2].get_text(strip=True)
                        birthdate = datetime.strptime(birthdate_str, "%d/%m/%Y").date()

                        # Get current date in India timezone
                        IST = pytz.timezone('Asia/Kolkata')
                        today = datetime.now(IST).date()

                        user_data["is_birthday"] = (
                            birthdate.month == today.month and
                            birthdate.day == today.day
                        )
                        user_data["profile_data"]["birth_date"] = birthdate_str

                    except Exception as e:
                        self.logger.warning(f"Failed to parse birth date: {str(e)}")

                # Extract additional information if available
                if len(personal_info) > 3:
                    for i, info_cell in enumerate(personal_info[3:], start=3):
                        info_text = info_cell.get_text(strip=True)
                        if info_text:
                            user_data["profile_data"][f"info_{i}"] = info_text

        except Exception as e:
            self.logger.warning(f"Error parsing scholarship page: {str(e)}")

    async def _extract_from_profile_page(self, soup: BeautifulSoup, user_data: Dict[str, Any]) -> None:
        """
        Extract user information from profile page

        Args:
            soup: BeautifulSoup object of the page
            user_data: Dictionary to update with extracted data
        """
        try:
            # Try to find username in profile page if we couldn't get it from scholarship page
            if user_data["username"] == user_data["roll_number"]:
                name_element = soup.find("input", {"id": "txtName"})
                if name_element and name_element.get("value"):
                    username = name_element["value"].strip()
                    if username and len(username) > 0:
                        user_data["username"] = username
                        user_data["profile_data"]["full_name"] = username

            # Extract other profile information
            profile_fields = {
                "txtEmail": "email",
                "txtPhone": "phone",
                "txtAddress": "address",
                "txtDepartment": "department",
                "txtBatch": "batch"
            }

            for field_id, field_name in profile_fields.items():
                element = soup.find("input", {"id": field_id})
                if element and element.get("value"):
                    value = element["value"].strip()
                    if value:
                        user_data["profile_data"][field_name] = value

        except Exception as e:
            self.logger.warning(f"Error parsing profile page: {str(e)}")

    @log_function_call
    async def generate_greeting(self, user_info: UserInfo) -> str:
        """
        Generate a personalized greeting for the user

        Args:
            user_info: User information

        Returns:
            Personalized greeting string
        """
        self.log_operation("generate_greeting", username=user_info.username)

        try:
            # Get current time in IST
            IST = pytz.timezone('Asia/Kolkata')
            current_time = datetime.now(IST)
            hour = current_time.hour

            # Determine time-based greeting
            if hour < 12:
                time_greeting = "Good Morning"
            elif hour < 18:
                time_greeting = "Good Afternoon"
            else:
                time_greeting = "Good Evening"

            # Use full name if available, otherwise use username
            display_name = user_info.profile_data.get("full_name", user_info.username)

            # Add birthday greeting if applicable
            if user_info.is_birthday:
                return f"{time_greeting} & Happy Birthday, {display_name}! 🎉"
            else:
                return f"{time_greeting}, {display_name}!"

        except Exception as e:
            self.logger.error(f"Failed to generate greeting: {str(e)}")
            return f"Welcome, {user_info.username}!"

    @log_function_call
    async def get_profile_summary(self, user_info: UserInfo) -> Dict[str, Any]:
        """
        Generate a profile summary

        Args:
            user_info: User information

        Returns:
            Dictionary with profile summary
        """
        self.log_operation("get_profile_summary", username=user_info.username)

        try:
            summary = {
                "display_name": user_info.username,
                "roll_number": user_info.roll_number,
                "is_birthday_today": user_info.is_birthday,
                "profile_completion": 0,
                "available_fields": []
            }

            # Calculate profile completion
            total_fields = 6  # Expected profile fields
            completed_fields = len([
                field for field in ["full_name", "email", "phone", "address", "department", "batch"]
                if user_info.profile_data.get(field)
            ])

            summary["profile_completion"] = round((completed_fields / total_fields) * 100, 1)
            summary["available_fields"] = list(user_info.profile_data.keys())

            return summary

        except Exception as e:
            self.logger.error(f"Failed to generate profile summary: {str(e)}")
            return {
                "display_name": user_info.username,
                "roll_number": user_info.roll_number,
                "is_birthday_today": user_info.is_birthday,
                "profile_completion": 0,
                "available_fields": []
            }
