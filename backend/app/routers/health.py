from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def get_health(db: Session = Depends(get_db)) -> dict[str, str]:
    settings = get_settings()

    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database health check failed.",
        ) from exc

    return {
        "status": "ok",
        "service": settings.app_name,
        "version": settings.app_version,
        "database": "ok",
    }
