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
