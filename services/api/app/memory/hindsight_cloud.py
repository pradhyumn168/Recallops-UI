import logging
from typing import Dict, Any, List, Optional
import httpx

from .repository import HindsightMemoryRepository
from ..config import settings

logger = logging.getLogger("recallops.memory.cloud")


class HindsightCloudMemoryClient(HindsightMemoryRepository):
    """
    Production client connecting to the real Hindsight Cloud Memory API.
    Activated when HINDSIGHT_API_KEY is present in the environment.
    """

    def __init__(self):
        self.api_key = settings.hindsight_api_key
        self.base_url = settings.hindsight_api_base_url.rstrip("/")
        self.bank_map = {
            "incidents": settings.hindsight_incidents_bank_id,
            "fix-outcomes": settings.hindsight_fix_outcomes_bank_id,
            "team": settings.hindsight_team_bank_id,
            "baseline": settings.hindsight_baseline_bank_id,
        }
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "X-Client-Application": "RecallOps-Agent/1.0",
        }

    def _resolve_bank_id(self, bank_name: str) -> str:
        return self.bank_map.get(bank_name.lower().strip(), bank_name)

    async def retain(
        self,
        bank: str,
        document_id: str,
        content: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        bank_id = self._resolve_bank_id(bank)
        payload = {
            "document_id": document_id,
            "content": content,
            "metadata": metadata or {},
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{self.base_url}/v1/banks/{bank_id}/retain",
                    headers=self.headers,
                    json=payload,
                )
                res.raise_for_status()
                return res.json()
        except Exception as e:
            logger.error("Hindsight Cloud retain failed: %s", e)
            raise

    async def recall(
        self,
        bank: str,
        query: str,
        limit: int = 5,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        bank_id = self._resolve_bank_id(bank)
        payload = {
            "query": query,
            "limit": limit,
            "filters": filters or {},
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{self.base_url}/v1/banks/{bank_id}/recall",
                    headers=self.headers,
                    json=payload,
                )
                res.raise_for_status()
                data = res.json()
                return data.get("results", [])
        except Exception as e:
            logger.error("Hindsight Cloud recall failed: %s", e)
            raise

    async def reflect(
        self,
        bank: str,
        incident_id: str,
        learning_summary: str,
    ) -> Dict[str, Any]:
        bank_id = self._resolve_bank_id(bank)
        payload = {
            "incident_id": incident_id,
            "learning_summary": learning_summary,
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{self.base_url}/v1/banks/{bank_id}/reflect",
                    headers=self.headers,
                    json=payload,
                )
                res.raise_for_status()
                return res.json()
        except Exception as e:
            logger.error("Hindsight Cloud reflect failed: %s", e)
            raise

    async def get_bank_stats(self) -> Dict[str, int]:
        counts = {}
        for name, bank_id in self.bank_map.items():
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    res = await client.get(
                        f"{self.base_url}/v1/banks/{bank_id}/stats",
                        headers=self.headers,
                    )
                    if res.status_code == 200:
                        counts[f"{name.replace('-', '_')}_count"] = res.json().get("document_count", 0)
                    else:
                        counts[f"{name.replace('-', '_')}_count"] = 0
            except Exception:
                counts[f"{name.replace('-', '_')}_count"] = 0
        return counts
