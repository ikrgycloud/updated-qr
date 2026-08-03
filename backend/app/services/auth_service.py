from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models import User
from app.schemas.auth import AuthResponse, RegisterRequest, UserResponse


def _format_date(value: date) -> str:
    return value.isoformat()


def build_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        employee_id=user.employee_id,
        email=user.email,
        phone_number=user.phone_number,
        joining_date=_format_date(user.joining_date),
    )


def validate_referral_id(referral_id: str) -> bool:
    settings = get_settings()
    return referral_id.strip() == settings.referral_id


def register_user(db: Session, payload: RegisterRequest) -> AuthResponse:
    if not validate_referral_id(payload.referral_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid referral ID.",
        )

    employee_id = payload.employee_id.strip()
    email = payload.email.strip().lower()
    phone_number = payload.phone_number.strip()

    existing_user = (
        db.query(User)
        .filter(
            or_(
                User.employee_id == employee_id,
                User.email == email,
                User.phone_number == phone_number,
            )
        )
        .first()
    )
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee ID, email, or phone number is already registered.",
        )

    user = User(
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        employee_id=employee_id,
        password_hash=hash_password(payload.password),
        email=email,
        phone_number=phone_number,
        joining_date=payload.joining_date,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return build_auth_response(user)


def authenticate_user(db: Session, identifier: str, password: str) -> AuthResponse:
    cleaned_identifier = identifier.strip()
    normalized_identifier = cleaned_identifier.lower()
    user = (
        db.query(User)
        .filter(
            or_(
                User.employee_id == cleaned_identifier,
                User.email == normalized_identifier,
                User.phone_number == cleaned_identifier,
            )
        )
        .first()
    )

    if user is None or not user.is_active or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid login credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return build_auth_response(user)


def build_auth_response(user: User) -> AuthResponse:
    settings = get_settings()
    token = create_access_token(
        subject=str(user.id),
        secret_key=settings.auth_secret_key,
        expires_in_minutes=settings.access_token_expire_minutes,
    )
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=build_user_response(user),
    )
