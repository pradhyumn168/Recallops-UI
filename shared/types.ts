/**
 * Shared Type Definitions for RecallOps — Incident Memory Agent
 * Shared between apps/web, apps/desktop, and backend API contracts.
 */

export type SeverityLevel = 'P1' | 'P2' | 'P3' | 'P4';
export type IncidentStatus = 'Open' | 'Investigating' | 'Resolving' | 'Resolved' | 'Mitigated' | 'Closed';

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

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  team_service: string;
  on_call_status: 'Primary On-Call' | 'Secondary On-Call' | 'Available' | 'Off-Duty';
  initials: string;
  avatar_color?: string;
  is_lead?: boolean;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  category: 'incident' | 'memory' | 'assignment' | 'mitigation' | 'approval' | 'resolution' | 'postmortem';
  title: string;
  detail: string;
  actor: string;
  actor_role?: string;
  is_agent?: boolean;
  incident_id?: string;
  service?: string;
  severity?: 'P1' | 'P2' | 'P3' | 'P4';
  badge_label?: string;
}

export interface RemediationProgress {
  checklist: boolean[];
  resolutionNote: string;
  assignedOwner?: TeamMember;
}

export interface IncidentContext {
  incident_id: string;
  title: string;
  service: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  impactedUsers: number;
  impacted_users?: number;
  symptoms: string[];
  metrics: IncidentMetricSummary;
  affected_components: string[];
  recent_changes: RecentChange[];
  environment: string;
  timestamp: string;
  created_at?: string;
  updated_at?: string;
  owner?: TeamMember;
  assigned_responders?: TeamMember[];
  remediationData?: RemediationProgress;
}

export interface AlertRequest {
  incident_id?: string;
  title: string;
  service: string;
  severity: SeverityLevel;
  impactedUsers: number;
  impacted_users?: number;
  symptoms: string[];
  metrics: IncidentMetricSummary;
  affected_components: string[];
  recent_changes: RecentChange[];
  environment: string;
  timestamp?: string;
  owner?: TeamMember;
  assigned_responders?: TeamMember[];
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

export interface ChatRequest {
  query: string;
  session_id?: string;
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
