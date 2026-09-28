import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health_check_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "memory_banks" in data
        assert data["memory_banks"]["incidents_count"] >= 1


@pytest.mark.asyncio
async def test_alerts_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "title": "Checkout API latency after deployment",
            "service": "checkout-api",
            "severity": "P1",
            "symptoms": [
                "p95 latency spike to 8.4s",
                "5xx error surge",
                "Redis memory max-eviction alerts",
            ],
            "metrics": {
                "p95_latency_seconds": 8.4,
                "error_rate_percent": 18.6,
                "affected_checkout_attempts": 27400,
            },
            "affected_components": ["Checkout API", "Redis Cache", "Azure SQL"],
            "recent_changes": [
                {
                    "component": "checkout-api",
                    "version": "v4.18.2",
                    "description": "Cache configuration release updating Redis connection pool",
                    "deployed_ago_minutes": 19,
                    "author": "pipeline-bot",
                }
            ],
            "environment": "production-eastus-az",
        }

        response = await client.post("/api/alerts", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["incident_id"] == "INC-2026-0928"
        assert "INC-2025-0417" in data["recalled_incident_ids"]
        assert len(data["ranked_fixes"]) >= 1
        assert data["grounding_validation_status"] in ["PASSED", "REDACTED"]
        assert "briefing" in data
        assert len(data["briefing"]["failed_actions_to_avoid"]) >= 1


@pytest.mark.asyncio
async def test_incident_chat_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/incidents/INC-2026-0928/chat",
            json={"query": "Should we restart the Checkout API pods?"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "WARNING" in data["answer"] or "restart" in data["answer"].lower()
        assert "INC-2025-0417" in data["cited_incident_ids"]
        assert "FIX-2025-0417-2" in data["cited_fix_ids"]


@pytest.mark.asyncio
async def test_incident_resolve_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "confirmed_root_cause": "Redis maxmemory policy config regression in v4.18.2",
            "actions_taken": [
                "Roll back cache configuration release",
                "Temporarily scale Redis cluster capacity",
                "Validate eviction rate drops to zero",
            ],
            "actions_skipped": [],
            "actions_that_failed": [
                "Restart Checkout API pods (avoided per historical hazard warning)"
            ],
            "runbook_used": "Redis Latency and Eviction Response",
            "success_or_failure": "SUCCESS",
            "verification_metrics": {
                "p95_latency_seconds": 0.22,
                "error_rate_percent": 0.05,
                "eviction_rate_ops": 0.0,
            },
            "elapsed_resolution_minutes": 18,
            "lessons_learned": "Enforce mandatory 5% canary on all Redis pool size adjustments.",
            "follow_up_actions": [
                "Implement automated CI guard for Redis maxmemory-policy syntax",
                "Add Redis client queue gauge to Prometheus",
            ],
        }

        response = await client.post("/api/incidents/INC-2026-0928/resolve", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["status"] == "Resolved"
        assert data["memory_update_summary"]["retained_in_incidents_bank"] is True
        assert data["memory_update_summary"]["retained_in_fix_outcomes_bank"] is True
        assert data["memory_update_summary"]["team_knowledge_updated"] is True
        assert data["memory_update_summary"]["baseline_updated"] is False
