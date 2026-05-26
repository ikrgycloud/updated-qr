import json

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models import GeneratedQR
from app.schemas.qr import QRGenerateResponse, QRHistoryItem, QRHistoryResponse
from app.services.product_service import build_product_snapshot, encode_qr_payload, get_product


def generate_qr_record(db: Session, product_id: int, request_source: str) -> QRGenerateResponse:
    product = get_product(db, product_id)
    snapshot = build_product_snapshot(product)
    qr_payload = encode_qr_payload(snapshot)

    record = GeneratedQR(
        product_id=product.id,
        qr_payload=qr_payload,
        snapshot_json=json.dumps(snapshot),
        request_source=request_source,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return QRGenerateResponse(
        record_id=record.id,
        product_id=product.id,
        qr_payload=record.qr_payload,
        snapshot=snapshot,
        request_source=record.request_source,
        generated_at=record.generated_at,
    )


def list_qr_history(db: Session, limit: int, offset: int) -> QRHistoryResponse:
    total = db.query(func.count(GeneratedQR.id)).scalar() or 0
    records = (
        db.query(GeneratedQR)
        .options(joinedload(GeneratedQR.product))
        .order_by(GeneratedQR.generated_at.desc(), GeneratedQR.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    items = [
        QRHistoryItem(
            record_id=record.id,
            product_id=record.product_id,
            product_name=record.product.product_name,
            qr_payload=record.qr_payload,
            snapshot=json.loads(record.snapshot_json),
            request_source=record.request_source,
            generated_at=record.generated_at,
        )
        for record in records
    ]

    return QRHistoryResponse(total=total, items=items)
