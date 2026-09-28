import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .models.schemas import HealthResponse, MemoryBankStats
from .memory import get_memory_repository
from .routes.alerts import router as alerts_router
from .routes.incidents import router as incidents_router
from .routes.memory import router as memory_router
from .routes.runbooks import router as runbooks_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("recallops")

app = FastAPI(
    title="RecallOps — Incident Memory Agent API",
    description="Backend decision-support API for RecallOps Microsoft Hackathon agent.",
    version="1.0.0",
)

# CORS configuration for local React Vite and Electron desktop clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",  # Allow local Electron origin
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(alerts_router)
app.include_router(incidents_router)
app.include_router(memory_router)
app.include_router(runbooks_router)


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """
    System health and capability inspection endpoint.
    Exposes demo mode status, active models, and memory bank counts.
    """
    memory_repo = get_memory_repository()
    stats = await memory_repo.get_bank_stats()

    bank_stats = MemoryBankStats(
        incidents_count=stats.get("incidents_count", 0),
        fix_outcomes_count=stats.get("fix_outcomes_count", 0),
        team_count=stats.get("team_count", 0),
        baseline_count=stats.get("baseline_count", 0),
        mode="HINDSIGHT_CLOUD" if settings.is_hindsight_available else "DEMO_LOCAL",
    )

    return HealthResponse(
        status="healthy",
        version="1.0.0",
        demo_mode=settings.is_demo_mode,
        llm_primary_model=settings.groq_primary_model,
        llm_fallback_model=settings.groq_fallback_model,
        groq_available=settings.is_groq_available,
        hindsight_available=settings.is_hindsight_available,
        memory_banks=bank_stats,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.api_host, port=settings.api_port, reload=True)
