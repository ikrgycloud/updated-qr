from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class QRGenerateRequest(BaseModel):
    product_id: int = Field(gt=0)
    request_source: str = Field(default="backend-api", min_length=2, max_length=100)


class QRGenerateResponse(BaseModel):
    record_id: int
    product_id: int
    qr_payload: str
    snapshot: dict[str, Any]
    request_source: str
    generated_at: datetime


class QRHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    record_id: int
    product_id: int
    product_name: str
    qr_payload: str
    snapshot: dict[str, Any]
    request_source: str
    generated_at: datetime


class QRHistoryResponse(BaseModel):
    total: int
    items: list[QRHistoryItem]
