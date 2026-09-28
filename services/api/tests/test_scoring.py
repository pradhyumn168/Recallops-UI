import pytest
from app.scoring.outcome_scorer import OutcomeRankedScorer
from app.models.schemas import IncidentContext, IncidentMetricSummary, RecentChange


@pytest.fixture
def active_context():
    return IncidentContext(
        incident_id="INC-2026-0928",
        title="Checkout API latency after deployment",
        service="checkout-api",
        severity="P1",
        status="Investigating",
        symptoms=[
            "p95 latency spike to 8.4s",
            "5xx HTTP error rate surge to 18.6%",
            "Redis memory max-eviction threshold alerts",
        ],
        metrics=IncidentMetricSummary(
            p95_latency_seconds=8.4,
            error_rate_percent=18.6,
            affected_checkout_attempts=27400,
        ),
        affected_components=["Checkout API", "Redis Cache", "Azure SQL"],
        recent_changes=[
            RecentChange(
                component="checkout-api",
                version="v4.18.2",
                description="Cache configuration release updating Redis connection pool",
                deployed_ago_minutes=19,
            )
        ],
        environment="production-eastus-az",
        timestamp="2026-09-28T14:05:00Z",
    )


def test_outcome_ranked_scorer_high_match_on_similar_incident(active_context):
    scorer = OutcomeRankedScorer()

    hist_incident = {
        "incident_id": "INC-2025-0417",
        "title": "Checkout service latency after cache configuration deployment",
        "service": "checkout-api",
        "symptoms": ["latency spike", "elevated 5xx errors", "Redis evictions after a configuration release"],
        "confirmed_root_cause": "Redis max-memory policy caused cache churn",
        "timestamp": "2025-04-17T09:12:00Z",
    }

    successful_fix = {
        "fix_id": "FIX-2025-0417-1",
        "incident_id": "INC-2025-0417",
        "action_title": "Roll back cache configuration release",
        "success": True,
        "historical_success_rate": 0.95,
        "verification_metric": "Eviction ops drop below 10/sec",
        "runbook_id": "RB-REDIS-01",
    }

    score, breakdown = scorer.score_candidate_fix(active_context, hist_incident, successful_fix)
    assert score >= 0.80
    assert breakdown.service_similarity == 1.0
    assert breakdown.historical_success_rate == 0.95
    assert breakdown.failed_action_penalty == 0.0


def test_outcome_ranked_scorer_penalizes_failed_mitigations(active_context):
    scorer = OutcomeRankedScorer()

    hist_incident = {
        "incident_id": "INC-2025-0417",
        "title": "Checkout service latency after cache configuration deployment",
        "service": "checkout-api",
        "symptoms": ["latency spike", "Redis evictions"],
        "failed_mitigation": "restarting Checkout API pods did not resolve the issue.",
        "timestamp": "2025-04-17T09:12:00Z",
    }

    failed_fix = {
        "fix_id": "FIX-2025-0417-2",
        "incident_id": "INC-2025-0417",
        "action_title": "Restart Checkout API pods",
        "success": False,
        "is_failed_mitigation": True,
        "hazard_warning": "CRITICAL HAZARD: Restarting pods under Redis eviction storms causes instant cold cache stampedes.",
    }

    score, breakdown = scorer.score_candidate_fix(active_context, hist_incident, failed_fix)
    # The penalty should severely drop the score
    assert breakdown.failed_action_penalty > 0.5
    assert score < 0.20


def test_rank_fixes_separates_failed_mitigations(active_context):
    scorer = OutcomeRankedScorer()

    hist_incidents = [
        {
            "incident_id": "INC-2025-0417",
            "title": "Checkout latency",
            "service": "checkout-api",
            "failed_mitigation": "restarting pods",
        }
    ]

    recalled_fixes = [
        {
            "fix_id": "FIX-1",
            "incident_id": "INC-2025-0417",
            "action_title": "Roll back config",
            "success": True,
            "historical_success_rate": 0.95,
        },
        {
            "fix_id": "FIX-2",
            "incident_id": "INC-2025-0417",
            "action_title": "Restart pods",
            "success": False,
            "is_failed_mitigation": True,
        },
    ]

    ranked_actions, failed_notices = scorer.rank_fixes(active_context, hist_incidents, recalled_fixes)
    assert len(ranked_actions) == 1
    assert ranked_actions[0].action_id == "FIX-1"
    assert len(failed_notices) == 1
    assert "Restart" in failed_notices[0].action_title
