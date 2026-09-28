import pytest
from unittest.mock import AsyncMock, patch
from app.providers.groq_provider import GroqProvider


@pytest.mark.asyncio
async def test_groq_provider_demo_mode_output():
    provider = GroqProvider()
    evidence_packet = {
        "allowed_incident_ids": ["INC-2025-0417"],
        "allowed_fix_ids": ["FIX-2025-0417-1"],
    }
    active_context = {"service": "checkout-api"}

    briefing, model_used, fallback_used, latency = await provider.generate_briefing(
        evidence_packet, active_context
    )

    assert "probable_root_cause" in briefing
    assert "INC-2025-0417" in briefing["cited_incident_ids"]
    assert fallback_used is False
    assert latency > 0


@pytest.mark.asyncio
async def test_groq_failover_when_primary_fails():
    with patch("app.config.settings.groq_api_key", "mock_key"):
        provider = GroqProvider()
        provider.api_key = "mock_key"

        # Mock primary failing and fallback succeeding
        mock_fallback_output = {
            "probable_root_cause": "Cache evictions from fallback",
            "confidence": 0.88,
            "evidence_summary": "Synthesized by Qwen fallback",
            "cited_incident_ids": ["INC-2025-0417"],
            "cited_fix_ids": ["FIX-2025-0417-1"],
            "risks": ["Risk 1"],
            "escalation_conditions": ["Escalate 1"],
            "evidence_gaps": [],
        }

        async def mock_call(model, messages, **kwargs):
            if "gpt-oss-120b" in model:
                raise Exception("503 Service Unavailable / Rate Limit Exceeded")
            return mock_fallback_output

        with patch.object(provider, "_call_model", side_effect=mock_call):
            evidence_packet = {
                "allowed_incident_ids": ["INC-2025-0417"],
                "allowed_fix_ids": ["FIX-2025-0417-1"],
            }
            briefing, model_used, fallback_used, latency = await provider.generate_briefing(
                evidence_packet, {"service": "checkout-api"}
            )

            assert fallback_used is True
            assert model_used == provider.fallback_model
            assert briefing["probable_root_cause"] == "Cache evictions from fallback"
