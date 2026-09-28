import {
  AlertRequest,
  AlertResponse,
  ChatResponse,
  HealthResponse,
  IncidentContext,
  MemoryBankStats,
  ResolveRequest,
  ResolveResponse,
  Runbook,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class RecallOpsApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL.replace(/\/$/, '');
  }

  async getHealth(): Promise<HealthResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      // Local fallback for offline / standalone preview
      return {
        status: 'healthy (client demo mode)',
        version: '1.0.0',
        demo_mode: true,
        llm_primary_model: 'openai/gpt-oss-120b',
        llm_fallback_model: 'qwen/qwen3.8-27b',
        groq_available: false,
        hindsight_available: false,
        memory_banks: {
          incidents_count: 3,
          fix_outcomes_count: 6,
          team_count: 1,
          baseline_count: 0,
          mode: 'DEMO_LOCAL',
        },
      };
    }
  }

  async getActiveIncident(): Promise<IncidentContext> {
    try {
      const res = await fetch(`${this.baseUrl}/api/incidents/active`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return {
        incident_id: 'INC-2026-0928',
        title: 'Checkout API latency after deployment',
        service: 'checkout-api',
        severity: 'P1',
        status: 'Investigating',
        symptoms: [
          'p95 latency spike to 8.4s',
          '5xx HTTP error rate surge to 18.6%',
          'Redis memory max-eviction threshold alerts',
          'Connection timeouts between Checkout API and downstream cache',
        ],
        metrics: {
          p95_latency_seconds: 8.4,
          error_rate_percent: 18.6,
          affected_checkout_attempts: 27400,
          redis_eviction_rate_ops: 1420,
          cpu_utilization_percent: 74.2,
        },
        affected_components: ['Checkout API', 'Redis Cache', 'Azure SQL', 'Kubernetes Cluster'],
        recent_changes: [
          {
            component: 'checkout-api',
            version: 'v4.18.2',
            description: 'Cache configuration release updating Redis connection pool and memory max-limit',
            deployed_ago_minutes: 19,
            author: 'pipeline-bot',
          },
        ],
        environment: 'production-eastus-az',
        timestamp: '2026-09-28T14:05:00Z',
      };
    }
  }

  async submitAlert(payload: AlertRequest): Promise<AlertResponse> {
    const res = await fetch(`${this.baseUrl}/api/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Alert analysis failed: HTTP ${res.status}`);
    return await res.json();
  }

  async sendChat(incidentId: string, query: string): Promise<ChatResponse> {
    const res = await fetch(`${this.baseUrl}/api/incidents/${incidentId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error(`Chat query failed: HTTP ${res.status}`);
    return await res.json();
  }

  async resolveIncident(incidentId: string, payload: ResolveRequest): Promise<ResolveResponse> {
    const res = await fetch(`${this.baseUrl}/api/incidents/${incidentId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Resolution recording failed: HTTP ${res.status}`);
    return await res.json();
  }

  async getMemoryStats(): Promise<MemoryBankStats> {
    try {
      const res = await fetch(`${this.baseUrl}/api/memory/stats`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return {
        incidents_count: 3,
        fix_outcomes_count: 6,
        team_count: 1,
        baseline_count: 0,
        mode: 'DEMO_LOCAL',
      };
    }
  }

  async getRunbooks(): Promise<Runbook[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/runbooks`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return [];
    }
  }
}

export const api = new RecallOpsApiClient();
