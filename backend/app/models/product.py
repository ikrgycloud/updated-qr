from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", index=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    detail: Mapped[ProductDetail] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
        uselist=False,
    )
    ingredients: Mapped[list["ProductIngredient"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="ProductIngredient.id",
    )
    qr_records: Mapped[list["GeneratedQR"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class ProductDetail(Base):
    __tablename__ = "product_details"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"),
        unique=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(120))
    crop_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    dosage: Mapped[str | None] = mapped_column(Text, nullable=True)
    gazette_notification: Mapped[str | None] = mapped_column(Text, nullable=True)
    dated: Mapped[date | None] = mapped_column(Date, nullable=True)
    marketing_license_number: Mapped[str | None] = mapped_column(String(255), nullable=True)
    authorization_number: Mapped[str | None] = mapped_column(String(255), nullable=True)
    manufacturing_license_number: Mapped[str | None] = mapped_column(String(255), nullable=True)
    manufactured_and_marketed_by: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    product: Mapped[Product] = relationship(back_populates="detail")


class ProductIngredient(Base):
    __tablename__ = "product_ingredients"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"),
        index=True,
    )
    ingredient_name: Mapped[str] = mapped_column(Text)
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    product: Mapped[Product] = relationship(back_populates="ingredients")
