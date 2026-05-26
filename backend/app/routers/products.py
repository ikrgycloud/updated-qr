from fastapi import APIRouter, Depends, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.product import ProductDetailResponse, ProductListItem, ProductUpsertRequest
from app.services.product_service import (
    build_product_response,
    create_product_template,
    get_deleted_product,
    get_product,
    list_deleted_products,
    list_products,
    permanently_delete_product,
    restore_product,
    soft_delete_product,
    update_product_template,
)

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductListItem])
def get_products(db: Session = Depends(get_db)) -> list[ProductListItem]:
    return list_products(db)


@router.get("/deleted", response_model=list[ProductListItem])
def get_deleted_products(db: Session = Depends(get_db)) -> list[ProductListItem]:
    return list_deleted_products(db)


@router.get("/deleted/{product_id}", response_model=ProductDetailResponse)
def get_deleted_product_by_id(product_id: int, db: Session = Depends(get_db)) -> ProductDetailResponse:
    product = get_deleted_product(db, product_id)
    return build_product_response(product)


@router.get("/{product_id}", response_model=ProductDetailResponse)
def get_product_by_id(product_id: int, db: Session = Depends(get_db)) -> ProductDetailResponse:
    product = get_product(db, product_id)
    return build_product_response(product)


@router.post("", response_model=ProductDetailResponse, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductUpsertRequest, db: Session = Depends(get_db)) -> ProductDetailResponse:
    product = create_product_template(db, payload)
    return build_product_response(product)


@router.put("/{product_id}", response_model=ProductDetailResponse)
def update_product(product_id: int, payload: ProductUpsertRequest, db: Session = Depends(get_db)) -> ProductDetailResponse:
    product = update_product_template(db, product_id, payload)
    return build_product_response(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)) -> Response:
    soft_delete_product(db, product_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{product_id}/restore", response_model=ProductListItem)
def restore_deleted_product(product_id: int, db: Session = Depends(get_db)) -> ProductListItem:
    return restore_product(db, product_id)


@router.delete("/{product_id}/permanent", status_code=status.HTTP_204_NO_CONTENT)
def delete_product_permanently(product_id: int, db: Session = Depends(get_db)) -> Response:
    permanently_delete_product(db, product_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
