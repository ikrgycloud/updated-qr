from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.qr import QRGenerateRequest, QRGenerateResponse, QRHistoryResponse
from app.services.qr_service import generate_qr_record, list_qr_history

router = APIRouter(prefix="/qr", tags=["qr"])


@router.post("/generate", response_model=QRGenerateResponse, status_code=201)
def generate_qr(payload: QRGenerateRequest, db: Session = Depends(get_db)) -> QRGenerateResponse:
    return generate_qr_record(db, product_id=payload.product_id, request_source=payload.request_source)


@router.get("/history", response_model=QRHistoryResponse)
def get_qr_history(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> QRHistoryResponse:
    return list_qr_history(db, limit=limit, offset=offset)
