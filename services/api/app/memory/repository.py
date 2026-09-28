from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional


class HindsightMemoryRepository(ABC):
    """
    Canonical interface for Hindsight Memory architecture.
    Provides isolated memory bank operations:
      - incidents
      - fix-outcomes
      - team
      - baseline (intentionally empty initially)
    """

    @abstractmethod
    async def retain(
        self,
        bank: str,
        document_id: str,
        content: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Retain vetted incident post-mortem or verified remediation outcome.
        Must never retain untrusted raw chat logs or secrets.
        """
        pass

    @abstractmethod
    async def recall(
        self,
        bank: str,
        query: str,
        limit: int = 5,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Recall relevant historical records from a specific memory bank.
        """
        pass

    @abstractmethod
    async def reflect(
        self,
        bank: str,
        incident_id: str,
        learning_summary: str,
    ) -> Dict[str, Any]:
        """
        Consolidate verified learning and update bank knowledge graphs.
        """
        pass

    @abstractmethod
    async def get_bank_stats(self) -> Dict[str, int]:
        """
        Return the count of documents across all banks.
        """
        pass
