from app.routers.auth import router as auth_router
from app.routers.health import router as health_router
from app.routers.products import router as products_router
from app.routers.qr import router as qr_router

__all__ = ["auth_router", "health_router", "products_router", "qr_router"]
