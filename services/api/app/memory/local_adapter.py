import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from .repository import HindsightMemoryRepository

logger = logging.getLogger("recallops.memory.local")


class LocalHindsightMemoryAdapter(HindsightMemoryRepository):
    """
    Local in-memory implementation of Hindsight Cloud Memory.
    Used in Demo Mode when HINDSIGHT_API_KEY is not configured.
    """

    def __init__(self, demo_data_path: Optional[Path] = None):
        self.banks: Dict[str, Dict[str, Dict[str, Any]]] = {
            "incidents": {},
            "fix-outcomes": {},
            "team": {},
            "baseline": {},  # Intentionally empty at first
        }
        self.reflections: List[Dict[str, Any]] = []
        self._load_seed_data(demo_data_path)

    def _load_seed_data(self, demo_data_path: Optional[Path]):
        if demo_data_path is None:
            # Default to shared/demo_data.json
            repo_root = Path(__file__).resolve().parent.parent.parent.parent.parent
            demo_data_path = repo_root / "shared" / "demo_data.json"

        if demo_data_path.exists():
            try:
                with open(demo_data_path, "r", encoding="utf-8") as f:
                    data = json.load(f)

                # Seed incidents bank
                for inc in data.get("historical_incidents", []):
                    self.banks["incidents"][inc["incident_id"]] = {
                        "id": inc["incident_id"],
                        "content": inc,
                        "metadata": {
                            "service": inc.get("service"),
                            "severity": inc.get("severity"),
                            "timestamp": inc.get("timestamp"),
                            "status": "Resolved",
                        },
                    }

                # Seed fix-outcomes bank
                for fix in data.get("fix_outcomes", []):
                    self.banks["fix-outcomes"][fix["fix_id"]] = {
                        "id": fix["fix_id"],
                        "content": fix,
                        "metadata": {
                            "incident_id": fix.get("incident_id"),
                            "success": fix.get("success"),
                            "runbook_id": fix.get("runbook_id"),
                            "is_failed_mitigation": fix.get("is_failed_mitigation", False),
                        },
                    }

                # Seed team bank
                for team_item in data.get("team_knowledge", []):
                    self.banks["team"][team_item["item_id"]] = {
                        "id": team_item["item_id"],
                        "content": team_item,
                        "metadata": {"service": team_item.get("service")},
                    }

                # Baseline bank remains intentionally empty!
                # Never populate baseline bank with generic invented advice.

                logger.info(
                    "LocalHindsightMemoryAdapter seeded: %d incidents, %d fix-outcomes, %d team items, %d baseline items",
                    len(self.banks["incidents"]),
                    len(self.banks["fix-outcomes"]),
                    len(self.banks["team"]),
                    len(self.banks["baseline"]),
                )
            except Exception as e:
                logger.error("Failed to load demo data from %s: %s", demo_data_path, e)

    async def retain(
        self,
        bank: str,
        document_id: str,
        content: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Retain verified post-incident or remediation outcomes.
        Only vetted incident data and final resolution outcomes are accepted.
        """
        bank_key = bank.lower().strip()
        if bank_key not in self.banks:
            self.banks[bank_key] = {}

        # Enforce baseline constraint: Never invent baseline knowledge
        if bank_key == "baseline" and not metadata.get("is_vetted_baseline", False):
            logger.warning("Attempted unvetted write to baseline bank rejected.")
            return {"status": "rejected", "reason": "Baseline bank requires strict vetting"}

        record = {
            "id": document_id,
            "content": content,
            "metadata": metadata or {},
            "retained_at": datetime.now(timezone.utc).isoformat(),
        }
        self.banks[bank_key][document_id] = record
        logger.info("Retained document %s into bank %s", document_id, bank_key)
        return {"status": "retained", "bank": bank_key, "document_id": document_id, "record": record}

    async def recall(
        self,
        bank: str,
        query: str,
        limit: int = 5,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Recall matching records from the specified memory bank.
        Ranks by token overlap and semantic metadata match.
        """
        bank_key = bank.lower().strip()
        if bank_key not in self.banks:
            return []

        query_terms = set(query.lower().replace("-", " ").replace("_", " ").split())
        scored_records = []

        for doc_id, doc in self.banks[bank_key].items():
            content = doc.get("content", {})
            metadata = doc.get("metadata", {})

            # Filter check
            if filters:
                match = True
                for fk, fv in filters.items():
                    if metadata.get(fk) != fv and content.get(fk) != fv:
                        match = False
                        break
                if not match:
                    continue

            # Calculate content relevance score
            content_str = json.dumps(content).lower()
            overlap_count = sum(1 for term in query_terms if term in content_str)

            # Boost if exact incident ID, service name, or symptom appears
            service_boost = 2.0 if metadata.get("service", "").lower() in query.lower() else 0.0
            
            # Explicit match_score from seed if available
            base_score = content.get("match_score", 0.5)

            final_relevance = base_score + (overlap_count * 0.08) + service_boost
            scored_records.append((final_relevance, doc))

        # Sort descending by relevance
        scored_records.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_records[:limit]]

    async def reflect(
        self,
        bank: str,
        incident_id: str,
        learning_summary: str,
    ) -> Dict[str, Any]:
        """
        Consolidate verified learning.
        """
        reflection_entry = {
            "bank": bank,
            "incident_id": incident_id,
            "learning_summary": learning_summary,
            "reflected_at": datetime.now(timezone.utc).isoformat(),
        }
        self.reflections.append(reflection_entry)
        logger.info("Reflected learning for incident %s in bank %s", incident_id, bank)
        return {"status": "reflected", "entry": reflection_entry}

    async def get_bank_stats(self) -> Dict[str, int]:
        return {
            "incidents_count": len(self.banks.get("incidents", {})),
            "fix_outcomes_count": len(self.banks.get("fix-outcomes", {})),
            "team_count": len(self.banks.get("team", {})),
            "baseline_count": len(self.banks.get("baseline", {})),
        }
