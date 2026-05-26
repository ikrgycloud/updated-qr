import base64
import json
from datetime import date, datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models import GeneratedQR, Product, ProductDetail, ProductIngredient
from app.schemas.product import (
    ProductDetailInput,
    ProductDetailPayload,
    ProductDetailResponse,
    ProductIngredientInput,
    ProductIngredientItem,
    ProductListItem,
    ProductQRCode,
    ProductUpsertRequest,
)


def _format_datetime(value: datetime | None) -> str:
    return value.isoformat() if value else ""


def _format_date(value: date | None) -> str:
    return value.isoformat() if value else ""


def _string_value(value: object | None) -> str:
    return "" if value is None else str(value)


def _nullable_text(value: str) -> str | None:
    cleaned = value.strip()
    return cleaned or None


def _nullable_date(value: str) -> date | None:
    cleaned = value.strip()
    if not cleaned:
        return None

    try:
        return date.fromisoformat(cleaned)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid date value '{value}'. Use YYYY-MM-DD format.",
        ) from exc


def _build_product_list_item(product: Product) -> ProductListItem:
    return ProductListItem(
        id=product.id,
        product_name=product.product_name,
        deleted_at=_format_datetime(product.deleted_at),
    )


def list_products(db: Session) -> list[ProductListItem]:
    products = (
        db.query(Product)
        .filter(Product.is_deleted.is_(False))
        .order_by(Product.product_name.asc())
        .all()
    )
    return [_build_product_list_item(product) for product in products]


def list_deleted_products(db: Session) -> list[ProductListItem]:
    products = (
        db.query(Product)
        .filter(Product.is_deleted.is_(True))
        .order_by(Product.deleted_at.desc().nullslast(), Product.product_name.asc())
        .all()
    )
    return [_build_product_list_item(product) for product in products]


def _query_product(db: Session, product_id: int, *, include_deleted: bool = False) -> Product | None:
    query = (
        db.query(Product)
        .options(joinedload(Product.detail), joinedload(Product.ingredients))
        .filter(Product.id == product_id)
    )
    if not include_deleted:
        query = query.filter(Product.is_deleted.is_(False))
    return query.first()


def get_product(db: Session, product_id: int) -> Product:
    product = _query_product(db, product_id)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} was not found.",
        )
    return product


def get_deleted_product(db: Session, product_id: int) -> Product:
    product = _query_product(db, product_id, include_deleted=True)
    if product is None or not product.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deleted product with id {product_id} was not found.",
        )
    return product


def _build_detail_payload(detail: ProductDetail | None) -> ProductDetailPayload:
    return ProductDetailPayload(
        name=_string_value(detail.name if detail else None),
        crop_name=_string_value(detail.crop_name if detail else None),
        dosage=_string_value(detail.dosage if detail else None),
        gazette_notification=_string_value(detail.gazette_notification if detail else None),
        dated=_format_date(detail.dated if detail else None),
        marketing_license_number=_string_value(detail.marketing_license_number if detail else None),
        authorization_number=_string_value(detail.authorization_number if detail else None),
        manufacturing_license_number=_string_value(detail.manufacturing_license_number if detail else None),
        manufactured_and_marketed_by=_string_value(detail.manufactured_and_marketed_by if detail else None),
        created_at=_format_datetime(detail.created_at if detail else None),
    )


def _build_ingredient_item(ingredient: ProductIngredient) -> ProductIngredientItem:
    return ProductIngredientItem(
        ingredient_name=_string_value(ingredient.ingredient_name),
        content=_string_value(ingredient.content),
        created_at=_format_datetime(ingredient.created_at),
    )


def build_product_snapshot(product: Product) -> dict[str, Any]:
    detail_payload = _build_detail_payload(product.detail)
    ingredient_items = [_build_ingredient_item(item) for item in product.ingredients]

    return {
        "id": product.id,
        "product_name": product.product_name,
        "created_at": _format_datetime(product.created_at),
        "updated_at": _format_datetime(product.updated_at),
        "details": detail_payload.model_dump(),
        "ingredients": [item.model_dump() for item in ingredient_items],
    }


def encode_qr_payload(snapshot: dict[str, Any]) -> str:
    raw = json.dumps(snapshot, separators=(",", ":"), sort_keys=True).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("utf-8")


def build_product_response(product: Product) -> ProductDetailResponse:
    snapshot = build_product_snapshot(product)
    qr_payload = encode_qr_payload(snapshot)

    return ProductDetailResponse(
        id=product.id,
        product_name=product.product_name,
        created_at=_format_datetime(product.created_at),
        updated_at=_format_datetime(product.updated_at),
        details=ProductDetailPayload(**snapshot["details"]),
        ingredients=[ProductIngredientItem(**item) for item in snapshot["ingredients"]],
        qr=ProductQRCode(qr_payload=qr_payload, format="base64url-json"),
    )


def _apply_detail_payload(detail: ProductDetail, payload: ProductDetailInput) -> None:
    detail.name = payload.name.strip()
    detail.crop_name = _nullable_text(payload.crop_name)
    detail.dosage = _nullable_text(payload.dosage)
    detail.gazette_notification = _nullable_text(payload.gazette_notification)
    detail.dated = _nullable_date(payload.dated)
    detail.marketing_license_number = _nullable_text(payload.marketing_license_number)
    detail.authorization_number = _nullable_text(payload.authorization_number)
    detail.manufacturing_license_number = _nullable_text(payload.manufacturing_license_number)
    detail.manufactured_and_marketed_by = _nullable_text(payload.manufactured_and_marketed_by)


def _build_ingredient_rows(payload_items: list[ProductIngredientInput]) -> list[ProductIngredient]:
    ingredient_rows: list[ProductIngredient] = []

    for item in payload_items:
        ingredient_name = item.ingredient_name.strip()
        content = item.content.strip()
        if not ingredient_name and not content:
            continue

        ingredient_rows.append(
            ProductIngredient(
                ingredient_name=ingredient_name,
                content=content,
            )
        )

    return ingredient_rows


def create_product_template(db: Session, payload: ProductUpsertRequest) -> Product:
    product_name = payload.product_name.strip()
    if not product_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Product name is required.",
        )

    existing_product = db.query(Product).filter(Product.product_name == product_name).first()
    if existing_product is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Product '{product_name}' already exists.",
        )

    detail_name = payload.details.name.strip() or product_name

    product = Product(product_name=product_name)
    product.detail = ProductDetail(name=detail_name)
    _apply_detail_payload(product.detail, ProductDetailInput(**(payload.details.model_dump() | {"name": detail_name})))
    product.ingredients = _build_ingredient_rows(payload.ingredients)
    product.updated_at = datetime.now(timezone.utc)

    db.add(product)
    db.commit()
    db.refresh(product)

    return get_product(db, product.id)


def update_product_template(db: Session, product_id: int, payload: ProductUpsertRequest) -> Product:
    product = get_product(db, product_id)
    product_name = payload.product_name.strip()
    if not product_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Product name is required.",
        )

    duplicate_product = (
        db.query(Product)
        .filter(Product.product_name == product_name, Product.id != product_id)
        .first()
    )
    if duplicate_product is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Product '{product_name}' already exists.",
        )

    product.product_name = product_name
    product.updated_at = datetime.now(timezone.utc)

    detail_name = payload.details.name.strip() or product_name
    detail = product.detail or ProductDetail(product=product, name=detail_name)
    detail_payload = ProductDetailInput(**(payload.details.model_dump() | {"name": detail_name}))
    _apply_detail_payload(detail, detail_payload)
    product.detail = detail

    product.ingredients.clear()
    product.ingredients.extend(_build_ingredient_rows(payload.ingredients))

    db.commit()
    db.refresh(product)

    return get_product(db, product.id)


def soft_delete_product(db: Session, product_id: int) -> None:
    product = _query_product(db, product_id, include_deleted=True)
    if product is None or product.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} was not found.",
        )

    product.is_deleted = True
    product.deleted_at = datetime.now(timezone.utc)
    product.updated_at = datetime.now(timezone.utc)
    db.commit()


def restore_product(db: Session, product_id: int) -> ProductListItem:
    product = get_deleted_product(db, product_id)
    product.is_deleted = False
    product.deleted_at = None
    product.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(product)
    return _build_product_list_item(product)


def permanently_delete_product(db: Session, product_id: int) -> None:
    product = get_deleted_product(db, product_id)
    db.query(GeneratedQR).filter(GeneratedQR.product_id == product.id).delete(synchronize_session=False)
    db.delete(product)
    db.commit()
