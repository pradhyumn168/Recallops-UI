from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


# --- Telemetry & Context Models ---

class RecentChange(BaseModel):
    component: str
    version: str
    description: str
    deployed_ago_minutes: int
    author: str = "pipeline-bot"


class IncidentMetricSummary(BaseModel):
    p95_latency_seconds: float
    error_rate_percent: float
    affected_checkout_attempts: int
    redis_eviction_rate_ops: Optional[float] = None
    cpu_utilization_percent: Optional[float] = None


class IncidentContext(BaseModel):
    incident_id: str
    title: str
    service: str
    severity: Literal["P1", "P2", "P3", "P4"] = "P1"
    status: Literal["Investigating", "Mitigated", "Resolved", "Closed"] = "Investigating"
    symptoms: List[str]
    metrics: IncidentMetricSummary
    affected_components: List[str]
    recent_changes: List[RecentChange]
    environment: str = "production-eastus-az"
    timestamp: str


# --- Alert Route Models ---

class AlertRequest(BaseModel):
    title: str
    service: str
    severity: Literal["P1", "P2", "P3", "P4"] = "P1"
    symptoms: List[str]
    metrics: IncidentMetricSummary
    affected_components: List[str]
    recent_changes: List[RecentChange]
    environment: str = "production-eastus-az"
    timestamp: Optional[str] = None


class ScoreBreakdown(BaseModel):
    service_similarity: float
    symptom_similarity: float
    dependency_similarity: float
    deployment_similarity: float
    historical_success_rate: float
    verification_quality: float
    recency_score: float
    evidence_completeness: float
    failed_action_penalty: float
    composite_score: float
    explanation: str


class RankedAction(BaseModel):
    action_id: str
    title: str
    rationale: str
    source_incident_ids: List[str]
    source_fix_ids: List[str]
    requires_human_approval: bool = True
    confidence: float
    historical_success_rate: float
    median_time_to_resolution_minutes: int
    score_breakdown: ScoreBreakdown
    verification_signal: str
    is_failed_mitigation: bool = False
    hazard_warning: Optional[str] = None


class FailedMitigationNotice(BaseModel):
    action_title: str
    source_incident_id: str
    hazard_description: str
    historical_failure_reason: str


class BriefingDistinction(BaseModel):
    recalled_evidence: List[str]
    ai_inference: List[str]
    unknown_or_gaps: List[str]


class GroundedBriefing(BaseModel):
    probable_root_cause: str
    confidence: float
    evidence_summary: str
    cited_incident_ids: List[str]
    cited_fix_ids: List[str]
    ranked_actions: List[RankedAction]
    failed_actions_to_avoid: List[FailedMitigationNotice]
    risks: List[str]
    escalation_conditions: List[str]
    evidence_gaps: List[str]
    distinction: BriefingDistinction


class AlertResponse(BaseModel):
    incident_id: str
    normalized_incident_context: IncidentContext
    recalled_incident_ids: List[str]
    recalled_fix_ids: List[str]
    ranked_fixes: List[RankedAction]
    briefing: GroundedBriefing
    model_used: str
    fallback_used: bool
    provider_latency_ms: float
    grounding_validation_status: Literal["PASSED", "REDACTED", "REJECTED"]
    memory_mode: Literal["DEMO_LOCAL", "HINDSIGHT_CLOUD"]


# --- Chat Route Models ---

class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    cited_incident_ids: List[str]
    cited_fix_ids: List[str]
    confidence: float
    evidence_gaps: List[str]
    model_used: str
    fallback_used: bool
    provider_latency_ms: float
    grounding_validation_status: Literal["PASSED", "REDACTED", "REJECTED"]


# --- Resolve Route Models ---

class VerificationMetrics(BaseModel):
    p95_latency_seconds: float
    error_rate_percent: float
    eviction_rate_ops: float


class ResolveRequest(BaseModel):
    confirmed_root_cause: str
    actions_taken: List[str]
    actions_skipped: List[str] = Field(default_factory=list)
    actions_that_failed: List[str] = Field(default_factory=list)
    runbook_used: str
    success_or_failure: Literal["SUCCESS", "FAILURE"] = "SUCCESS"
    verification_metrics: VerificationMetrics
    elapsed_resolution_minutes: int
    lessons_learned: str
    follow_up_actions: List[str] = Field(default_factory=list)
    responder_feedback: Optional[str] = None


class MemoryUpdateSummary(BaseModel):
    incident_id: str
    retained_in_incidents_bank: bool
    retained_in_fix_outcomes_bank: bool
    retained_fixes_count: int
    team_knowledge_updated: bool
    baseline_updated: bool
    reflection_applied: bool
    runbook_reliability_delta: float
    estimated_minutes_saved: int
    summary_message: str


class ResolveResponse(BaseModel):
    success: bool
    incident_id: str
    status: Literal["Investigating", "Mitigated", "Resolved", "Closed"]
    memory_update_summary: MemoryUpdateSummary
    updated_banks: Dict[str, int]


# --- Health & Memory Inspect Models ---

class MemoryBankStats(BaseModel):
    incidents_count: int
    fix_outcomes_count: int
    team_count: int
    baseline_count: int
    mode: Literal["DEMO_LOCAL", "HINDSIGHT_CLOUD"]


class HealthResponse(BaseModel):
    status: str
    version: str
    demo_mode: bool
    llm_primary_model: str
    llm_fallback_model: str
    groq_available: bool
    hindsight_available: bool
    memory_banks: MemoryBankStats
