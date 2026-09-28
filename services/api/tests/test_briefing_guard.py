import pytest
from app.guards.briefing_guard import BriefingGuard


def test_briefing_guard_allowlist_generation():
    recalled_incidents = [
        {"incident_id": "INC-2025-0417", "title": "Cache latency"},
        {"incident_id": "INC-2025-0812", "title": "Queue lag"},
    ]
    recalled_fixes = [
        {"fix_id": "FIX-2025-0417-1", "action_title": "Roll back config"},
        {"fix_id": "FIX-2025-0417-2", "action_title": "Restart pods"},
    ]

    packet = BriefingGuard.build_evidence_packet(recalled_incidents, recalled_fixes)
    assert set(packet["allowed_incident_ids"]) == {"INC-2025-0417", "INC-2025-0812"}
    assert set(packet["allowed_fix_ids"]) == {"FIX-2025-0417-1", "FIX-2025-0417-2"}


def test_briefing_guard_redacts_hallucinated_incident():
    allowed_inc_ids = {"INC-2025-0417"}
    allowed_fix_ids = {"FIX-2025-0417-1"}

    hallucinated_output = {
        "probable_root_cause": "Cache churn similar to INC-2022-9999",  # Hallucinated ID
        "confidence": 0.95,
        "evidence_summary": "Synthesized from INC-2025-0417",
        "cited_incident_ids": ["INC-2025-0417", "INC-2022-9999"],  # Hallucinated cited ID
        "cited_fix_ids": ["FIX-2025-0417-1", "FIX-FAKED-001"],      # Hallucinated fix ID
        "risks": ["Risk 1"],
        "escalation_conditions": ["Condition 1"],
        "evidence_gaps": [],
    }

    briefing, status = BriefingGuard.validate_briefing(
        hallucinated_output,
        allowed_incident_ids=allowed_inc_ids,
        allowed_fix_ids=allowed_fix_ids,
    )

    assert status == "REDACTED"
    assert "INC-2022-9999" not in briefing.cited_incident_ids
    assert "FIX-FAKED-001" not in briefing.cited_fix_ids
    assert briefing.cited_incident_ids == ["INC-2025-0417"]
    assert briefing.cited_fix_ids == ["FIX-2025-0417-1"]


def test_briefing_guard_valid_briefing_passes():
    allowed_inc_ids = {"INC-2025-0417"}
    allowed_fix_ids = {"FIX-2025-0417-1"}

    valid_output = {
        "probable_root_cause": "Redis max-memory churn",
        "confidence": 0.92,
        "evidence_summary": "Synthesized from verified memory INC-2025-0417",
        "cited_incident_ids": ["INC-2025-0417"],
        "cited_fix_ids": ["FIX-2025-0417-1"],
        "risks": ["Cascading database timeouts"],
        "escalation_conditions": ["If p95 exceeds 5s after 10 min"],
        "evidence_gaps": ["Pod connection queue metric missing"],
    }

    briefing, status = BriefingGuard.validate_briefing(
        valid_output,
        allowed_incident_ids=allowed_inc_ids,
        allowed_fix_ids=allowed_fix_ids,
    )

    assert status == "PASSED"
    assert briefing.confidence == 0.92
    assert briefing.cited_incident_ids == ["INC-2025-0417"]
