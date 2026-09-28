export type SeverityLevel = 'P1' | 'P2' | 'P3' | 'P4';
export type IncidentStatus = 'Investigating' | 'Mitigated' | 'Resolved' | 'Closed';

export interface IncidentMetricSummary {
  p95_latency_seconds: number;
  error_rate_percent: number;
  affected_checkout_attempts: number;
  redis_eviction_rate_ops?: number;
  cpu_utilization_percent?: number;
}

export interface RecentChange {
  component: string;
  version: string;
  description: string;
  deployed_ago_minutes: number;
  author: string;
}

export interface IncidentContext {
  incident_id: string;
  title: string;
  service: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  symptoms: string[];
  metrics: IncidentMetricSummary;
  affected_components: string[];
  recent_changes: RecentChange[];
  environment: string;
  timestamp: string;
}

export interface AlertRequest {
  title: string;
  service: string;
  severity: SeverityLevel;
  symptoms: string[];
  metrics: IncidentMetricSummary;
  affected_components: string[];
  recent_changes: RecentChange[];
  environment: string;
  timestamp?: string;
}

export interface ScoreBreakdown {
  service_similarity: number;
  symptom_similarity: number;
  dependency_similarity: number;
  deployment_similarity: number;
  historical_success_rate: number;
  verification_quality: number;
  recency_score: number;
  evidence_completeness: number;
  failed_action_penalty: number;
  composite_score: number;
  explanation: string;
}

export interface RankedAction {
  action_id: string;
  title: string;
  rationale: string;
  source_incident_ids: string[];
  source_fix_ids: string[];
  requires_human_approval: boolean;
  confidence: number;
  historical_success_rate: number;
  median_time_to_resolution_minutes: number;
  score_breakdown: ScoreBreakdown;
  verification_signal: string;
  is_failed_mitigation?: boolean;
  hazard_warning?: string;
  approved?: boolean;
  execution_status?: 'pending' | 'completed' | 'skipped' | 'failed';
}

export interface FailedMitigationNotice {
  action_title: string;
  source_incident_id: string;
  hazard_description: string;
  historical_failure_reason: string;
}

export interface GroundedBriefing {
  probable_root_cause: string;
  confidence: number;
  evidence_summary: string;
  cited_incident_ids: string[];
  cited_fix_ids: string[];
  ranked_actions: RankedAction[];
  failed_actions_to_avoid: FailedMitigationNotice[];
  risks: string[];
  escalation_conditions: string[];
  evidence_gaps: string[];
  distinction: {
    recalled_evidence: string[];
    ai_inference: string[];
    unknown_or_gaps: string[];
  };
}

export interface AlertResponse {
  incident_id: string;
  normalized_incident_context: IncidentContext;
  recalled_incident_ids: string[];
  recalled_fix_ids: string[];
  ranked_fixes: RankedAction[];
  briefing: GroundedBriefing;
  model_used: string;
  fallback_used: boolean;
  provider_latency_ms: number;
  grounding_validation_status: 'PASSED' | 'REDACTED' | 'REJECTED';
  memory_mode: 'DEMO_LOCAL' | 'HINDSIGHT_CLOUD';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  cited_incident_ids?: string[];
  cited_fix_ids?: string[];
  confidence?: number;
  evidence_gaps?: string[];
  model_used?: string;
  fallback_used?: boolean;
}

export interface ChatResponse {
  answer: string;
  cited_incident_ids: string[];
  cited_fix_ids: string[];
  confidence: number;
  evidence_gaps: string[];
  model_used: string;
  fallback_used: boolean;
  provider_latency_ms: number;
  grounding_validation_status: 'PASSED' | 'REDACTED' | 'REJECTED';
}

export interface ResolveRequest {
  confirmed_root_cause: string;
  actions_taken: string[];
  actions_skipped: string[];
  actions_that_failed: string[];
  runbook_used: string;
  success_or_failure: 'SUCCESS' | 'FAILURE';
  verification_metrics: {
    p95_latency_seconds: number;
    error_rate_percent: number;
    eviction_rate_ops: number;
  };
  elapsed_resolution_minutes: number;
  lessons_learned: string;
  follow_up_actions: string[];
  responder_feedback?: string;
}

export interface MemoryUpdateSummary {
  incident_id: string;
  retained_in_incidents_bank: boolean;
  retained_in_fix_outcomes_bank: boolean;
  retained_fixes_count: number;
  team_knowledge_updated: boolean;
  baseline_updated: boolean;
  reflection_applied: boolean;
  runbook_reliability_delta: number;
  estimated_minutes_saved: number;
  summary_message: string;
}

export interface ResolveResponse {
  success: boolean;
  incident_id: string;
  status: IncidentStatus;
  memory_update_summary: MemoryUpdateSummary;
  updated_banks: {
    incidents_count: number;
    fix_outcomes_count: number;
    team_count: number;
    baseline_count: number;
  };
}

export interface MemoryBankStats {
  incidents_count: number;
  fix_outcomes_count: number;
  team_count: number;
  baseline_count: number;
  mode: 'DEMO_LOCAL' | 'HINDSIGHT_CLOUD';
}

export interface HealthResponse {
  status: string;
  version: string;
  demo_mode: boolean;
  llm_primary_model: string;
  llm_fallback_model: string;
  groq_available: boolean;
  hindsight_available: boolean;
  memory_banks: MemoryBankStats;
}

export interface RunbookStep {
  step_number: number;
  name: string;
  command: string;
  intent: string;
}

export interface Runbook {
  runbook_id: string;
  title: string;
  service: string;
  author: string;
  historical_uses: number;
  historical_success_rate: number;
  avg_mitigation_time_minutes: number;
  summary: string;
  prerequisites: string[];
  steps: RunbookStep[];
}
