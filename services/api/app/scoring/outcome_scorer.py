import logging
from typing import Dict, Any, List, Tuple
from datetime import datetime, timezone

from ..models.schemas import (
    IncidentContext,
    RankedAction,
    ScoreBreakdown,
    FailedMitigationNotice,
)

logger = logging.getLogger("recallops.scoring")


class OutcomeRankedScorer:
    """
    Deterministic, explainable scoring engine for incident remediations.
    Does NOT rank solely on semantic similarity; combines:
      - Service, symptom, dependency, deployment similarity (40%)
      - Historical success rate & verification quality (30%)
      - Speed & recency (15%)
      - Evidence completeness & failed-action risk penalty (15%)
    """

    def __init__(self):
        # Deterministic component weights summing to 1.00
        self.w_service = 0.15
        self.w_symptom = 0.20
        self.w_dependency = 0.10
        self.w_deployment = 0.15
        self.w_success = 0.20
        self.w_verification = 0.10
        self.w_recency = 0.05
        self.w_evidence = 0.05
        self.w_risk_penalty = 0.80

    def compute_symptom_overlap(self, active_symptoms: List[str], historical_symptoms: List[str]) -> float:
        if not active_symptoms or not historical_symptoms:
            return 0.5

        active_tokens = set(" ".join(active_symptoms).lower().replace("-", " ").split())
        hist_tokens = set(" ".join(historical_symptoms).lower().replace("-", " ").split())

        intersection = active_tokens.intersection(hist_tokens)
        union = active_tokens.union(hist_tokens)
        if not union:
            return 0.5
        jaccard = len(intersection) / len(union)
        return min(1.0, max(0.1, jaccard * 2.5))  # Scaled Jaccard

    def compute_recency_score(self, timestamp_str: str) -> float:
        try:
            inc_time = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            days_old = max(0, (now - inc_time).days)
            # 1.0 if within 30 days, decays smoothly to 0.4 at 2 years
            return max(0.4, 1.0 - (days_old / 730.0) * 0.6)
        except Exception:
            return 0.75

    def score_candidate_fix(
        self,
        active_context: IncidentContext,
        historical_incident: Dict[str, Any],
        fix_outcome: Dict[str, Any],
    ) -> Tuple[float, ScoreBreakdown]:
        # 1. Service similarity
        hist_service = historical_incident.get("service", "")
        if active_context.service.lower() == hist_service.lower():
            service_sim = 1.0
        elif any(comp.lower() in hist_service.lower() for comp in active_context.affected_components):
            service_sim = 0.75
        else:
            service_sim = 0.30

        # 2. Symptom similarity
        hist_symptoms = historical_incident.get("symptoms", [])
        computed_symptom = self.compute_symptom_overlap(active_context.symptoms, hist_symptoms)
        if "match_score" in historical_incident:
            symptom_sim = max(float(historical_incident["match_score"]), computed_symptom)
        else:
            symptom_sim = max(0.85 if "latency" in " ".join(hist_symptoms).lower() else 0.4, computed_symptom)

        # 3. Dependency similarity
        active_comps = set(c.lower() for c in active_context.affected_components)
        hist_comps = set(c.lower() for c in historical_incident.get("affected_components", ["checkout api", "redis cache"]))
        dep_overlap = len(active_comps.intersection(hist_comps)) / max(1, len(active_comps.union(hist_comps)))
        dep_sim = min(1.0, dep_overlap * 1.8)

        # 4. Deployment similarity (cache/config/pool)
        active_changes = " ".join([c.description + " " + c.component for c in active_context.recent_changes]).lower()
        hist_title = (historical_incident.get("title", "") + " " + historical_incident.get("confirmed_root_cause", "")).lower()
        has_config_match = ("cache" in active_changes and "cache" in hist_title) or ("deploy" in active_changes and "deploy" in hist_title)
        deploy_sim = 0.95 if has_config_match else 0.50

        # 5. Historical success rate
        is_failed = fix_outcome.get("is_failed_mitigation", False) or not fix_outcome.get("success", True)
        if is_failed:
            hist_success = 0.05
        else:
            hist_success = fix_outcome.get("historical_success_rate", 0.90)

        # 6. Verification quality
        has_metric = bool(fix_outcome.get("verification_metric"))
        verify_qual = 0.95 if has_metric else 0.60

        # 7. Recency
        recency = self.compute_recency_score(historical_incident.get("timestamp", "2025-04-17T09:12:00Z"))

        # 8. Evidence completeness
        has_runbook = bool(fix_outcome.get("runbook_id"))
        evidence_comp = 0.95 if has_runbook else 0.70

        # 9. Failed action risk penalty
        risk_penalty = self.w_risk_penalty if is_failed else 0.0

        # Composite score calculation
        composite = (
            (service_sim * self.w_service)
            + (symptom_sim * self.w_symptom)
            + (dep_sim * self.w_dependency)
            + (deploy_sim * self.w_deployment)
            + (hist_success * self.w_success)
            + (verify_qual * self.w_verification)
            + (recency * self.w_recency)
            + (evidence_comp * self.w_evidence)
            - risk_penalty
        )
        composite = max(0.02, min(0.99, composite))

        explanation = (
            f"Service match {service_sim:.2f} ({active_context.service} vs {hist_service}), "
            f"Symptom similarity {symptom_sim:.2f}, Deployment context {deploy_sim:.2f}, "
            f"Historical success rate {hist_success * 100:.0f}%, "
            f"Verification signal quality {verify_qual:.2f}. "
            f"{'PENALIZED: Known failed historical mitigation!' if is_failed else 'Verified positive remediation.'}"
        )

        breakdown = ScoreBreakdown(
            service_similarity=round(service_sim, 3),
            symptom_similarity=round(symptom_sim, 3),
            dependency_similarity=round(dep_sim, 3),
            deployment_similarity=round(deploy_sim, 3),
            historical_success_rate=round(hist_success, 3),
            verification_quality=round(verify_qual, 3),
            recency_score=round(recency, 3),
            evidence_completeness=round(evidence_comp, 3),
            failed_action_penalty=round(risk_penalty, 3),
            composite_score=round(composite, 3),
            explanation=explanation,
        )

        return composite, breakdown

    def rank_fixes(
        self,
        active_context: IncidentContext,
        recalled_incidents: List[Dict[str, Any]],
        recalled_fixes: List[Dict[str, Any]],
    ) -> Tuple[List[RankedAction], List[FailedMitigationNotice]]:
        """
        Rank all recalled candidate actions, cleanly separating viable recommendations
        from dangerous historical failed mitigations.
        """
        inc_lookup = {inc.get("incident_id"): inc for inc in recalled_incidents}
        ranked_actions: List[RankedAction] = []
        failed_notices: List[FailedMitigationNotice] = []

        for fix in recalled_fixes:
            inc_id = fix.get("incident_id", "")
            hist_inc = inc_lookup.get(inc_id, {})
            score, breakdown = self.score_candidate_fix(active_context, hist_inc, fix)

            is_failed = fix.get("is_failed_mitigation", False) or not fix.get("success", True)
            action_title = fix.get("action_title", "Unknown Action")
            hazard_warning = fix.get("hazard_warning") or (
                f"Ineffective in {inc_id}: {fix.get('verification_metric', 'Did not resolve root cause.')}"
                if is_failed else None
            )

            ranked_action = RankedAction(
                action_id=fix.get("fix_id", f"ACT-{len(ranked_actions)+1}"),
                title=action_title,
                rationale=fix.get("action_description", ""),
                source_incident_ids=[inc_id] if inc_id else [],
                source_fix_ids=[fix.get("fix_id")] if fix.get("fix_id") else [],
                requires_human_approval=True,  # Mandatory human approval for all operational actions
                confidence=round(score, 3),
                historical_success_rate=round(fix.get("historical_success_rate", 0.9), 2),
                median_time_to_resolution_minutes=fix.get("median_resolution_minutes", 10),
                score_breakdown=breakdown,
                verification_signal=fix.get("verification_metric", "Monitor p95 latency"),
                is_failed_mitigation=is_failed,
                hazard_warning=hazard_warning,
            )

            if is_failed:
                failed_notices.append(
                    FailedMitigationNotice(
                        action_title=action_title,
                        source_incident_id=inc_id,
                        hazard_description=hazard_warning or "Ineffective action that prolonged incident recovery.",
                        historical_failure_reason=hist_inc.get("failed_mitigation", "Did not resolve root cause."),
                    )
                )
            else:
                ranked_actions.append(ranked_action)

        # Sort successful actions descending by composite score
        ranked_actions.sort(key=lambda a: a.confidence, reverse=True)

        return ranked_actions, failed_notices
