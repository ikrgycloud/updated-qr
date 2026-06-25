from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


settings = get_settings()

engine_kwargs: dict[str, object] = {}
if settings.database_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(settings.database_url, **engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app.models import generated_qr, product  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _ensure_product_soft_delete_columns()
    _ensure_product_detail_description_column()
    _seed_product_detail_descriptions()


def _ensure_product_soft_delete_columns() -> None:
    inspector = inspect(engine)
    try:
        product_columns = {column["name"] for column in inspector.get_columns("products")}
    except Exception:
        return

    statements: list[str] = []
    if "is_deleted" not in product_columns:
        statements.append("ALTER TABLE products ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE")
    if "deleted_at" not in product_columns:
        statements.append("ALTER TABLE products ADD COLUMN deleted_at TIMESTAMP NULL")

    if not statements:
        return

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


def _ensure_product_detail_description_column() -> None:
    inspector = inspect(engine)
    try:
        detail_columns = {column["name"] for column in inspector.get_columns("product_details")}
    except Exception:
        return

    if "product_description" in detail_columns:
        return

    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE product_details ADD COLUMN product_description TEXT NULL"))


def _seed_product_detail_descriptions() -> None:
    descriptions = {
        1: "mixture of seaweed extract; Humic and Fulvic acid, Ammo acids and Vitamins (Liquid)",
        2: "Mixture of Humic axid and Seaweed extract (powder)",
        3: "Mixture of Botanical extarct and Seaweed extract (Liquid)",
        4: "Mixture of Humic acid and Seaweed extract (Granules)",
        5: "Protein Hydrolysate 27% (Plant Source) (Powder)",
        6: "Protein Hydrolysate 25% (Plant Source) (Liquid)",
        7: "Protein Hydrolysate 1.5% (Plant Source) (granules)",
        8: "Sargassum Tenerrimum - 10% (Liquid)",
        9: "Sargassum Tenerrimum - 2% (Liquid)",
    }

    with engine.begin() as connection:
        for product_id, description in descriptions.items():
            connection.execute(
                text(
                    """
                    UPDATE product_details
                    SET product_description = :description
                    WHERE product_id = :product_id
                      AND (product_description IS NULL OR TRIM(product_description) = '')
                    """
                ),
                {"product_id": product_id, "description": description},
            )
