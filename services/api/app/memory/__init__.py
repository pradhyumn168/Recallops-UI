from typing import Optional
from .repository import HindsightMemoryRepository
from .local_adapter import LocalHindsightMemoryAdapter
from .hindsight_cloud import HindsightCloudMemoryClient
from ..config import settings

_memory_repo_instance: Optional[HindsightMemoryRepository] = None


def get_memory_repository() -> HindsightMemoryRepository:
    """
    Returns the configured memory repository:
      - LocalHindsightMemoryAdapter in Demo Mode
      - HindsightCloudMemoryClient when HINDSIGHT_API_KEY is available
    """
    global _memory_repo_instance
    if _memory_repo_instance is None:
        if settings.is_hindsight_available:
            _memory_repo_instance = HindsightCloudMemoryClient()
        else:
            _memory_repo_instance = LocalHindsightMemoryAdapter()
    return _memory_repo_instance


def reset_memory_repository():
    """Reset repository instance (useful in tests)."""
    global _memory_repo_instance
    _memory_repo_instance = None
