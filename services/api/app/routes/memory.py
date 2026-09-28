from fastapi import APIRouter, Depends
from ..memory import get_memory_repository, HindsightMemoryRepository
from ..models.schemas import MemoryBankStats
from ..config import settings

router = APIRouter(prefix="/api/memory", tags=["Memory"])


@router.get("/stats", response_model=MemoryBankStats)
async def get_memory_stats(
    memory_repo: HindsightMemoryRepository = Depends(get_memory_repository),
):
    """
    Returns current document counts across the four isolated Hindsight memory banks.
    """
    stats = await memory_repo.get_bank_stats()
    return MemoryBankStats(
        incidents_count=stats.get("incidents_count", 0),
        fix_outcomes_count=stats.get("fix_outcomes_count", 0),
        team_count=stats.get("team_count", 0),
        baseline_count=stats.get("baseline_count", 0),
        mode="HINDSIGHT_CLOUD" if settings.is_hindsight_available else "DEMO_LOCAL",
    )


@router.get("/banks/{bank_name}")
async def get_bank_documents(
    bank_name: str,
    memory_repo: HindsightMemoryRepository = Depends(get_memory_repository),
):
    """
    Retrieve documents stored in a specific memory bank.
    """
    results = await memory_repo.recall(bank_name, query="", limit=50)
    return {"bank": bank_name, "count": len(results), "documents": results}
