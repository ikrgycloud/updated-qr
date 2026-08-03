from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import User
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    ReferralVerifyRequest,
    ReferralVerifyResponse,
    RegisterRequest,
    UserResponse,
)
from app.services.auth_service import authenticate_user, build_user_response, register_user, validate_referral_id

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/referral/verify", response_model=ReferralVerifyResponse)
def verify_referral(payload: ReferralVerifyRequest) -> ReferralVerifyResponse:
    return ReferralVerifyResponse(allowed=validate_referral_id(payload.referral_id))


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    return register_user(db, payload)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    return authenticate_user(db, payload.identifier, payload.password)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return build_user_response(current_user)
