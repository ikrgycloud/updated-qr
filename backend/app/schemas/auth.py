from datetime import date

from pydantic import BaseModel, Field, field_validator


class ReferralVerifyRequest(BaseModel):
    referral_id: str = Field(min_length=1)


class ReferralVerifyResponse(BaseModel):
    allowed: bool


class RegisterRequest(BaseModel):
    referral_id: str = Field(min_length=1)
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)
    employee_id: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=8, max_length=128)
    email: str = Field(min_length=3, max_length=255)
    phone_number: str = Field(min_length=6, max_length=30)
    joining_date: date

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        cleaned = value.strip().lower()
        if "@" not in cleaned or "." not in cleaned.split("@")[-1]:
            raise ValueError("Enter a valid email address.")
        return cleaned

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, value: str) -> str:
        cleaned = value.strip()
        allowed = set("0123456789+- ()")
        if any(character not in allowed for character in cleaned):
            raise ValueError("Phone number contains invalid characters.")
        return cleaned

    @field_validator("first_name", "last_name", "employee_id")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    employee_id: str
    email: str
    phone_number: str
    joining_date: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
