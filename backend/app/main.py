"""PyQuest FastAPI Main Application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api import api_router

def create_application() -> FastAPI:
    """FastAPI Application Factory."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="PyQuest Backend API — Gamified Python Learning Adventure",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # CORS configuration for local React / Vite client
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Open for development
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=settings.API_PREFIX)

    @app.get("/")
    def root():
        return {
            "app": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "tagline": "Learn Python. Complete Quests. Master Code.",
            "health": f"{settings.API_PREFIX}/health",
            "docs": "/docs"
        }

    return app

app = create_application()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
