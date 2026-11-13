export type UserRole = 'admin' | 'analyst' | 'viewer';

export interface UserMembership {
  id: string;
  name: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  title: string;
  avatar?: string;
  active_tenant: string;
  memberships: UserMembership[];
  permissions: string[];
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface PostureMetrics {
  overall_score: number;
  status: string;
  summary_text: string;
  network_score: number;
  identity_score: number;
  adaptive_fw_score: number;
  threat_defense_score: number;
}

export interface MetricCardData {
  title: string;
  value: string;
  subtitle: string;
  badge_text: string;
  badge_variant: 'info' | 'success' | 'warning' | 'critical';
}

export interface DashboardSummary {
  posture: PostureMetrics;
  metrics: MetricCardData[];
  severity_distribution: Record<string, number>;
  vector_distribution: Record<string, number>;
  activity_timeline: Array<{ hour: string; blocked: number; inspected: number }>;
  recent_incidents: IncidentItem[];
  active_threats_preview: ThreatItem[];
}

export interface ThreatItem {
  id: string;
  source_ip: string;
  destination: string;
  vector: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  risk_score: number;
  status: 'ACTIVE' | 'CONTAINED' | 'BLOCKED' | 'TRIAGING' | 'ALLOWED' | 'AWAITING_REVIEW';
  review_status?: string;
  decision_source: string;
  timestamp: string;
  mitre_technique?: string;
  packet_rate?: string;
  evidence: string[];
}

export interface IncidentItem {
  id: string;
  incident_number: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TRIAGE' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';
  assigned_to: string;
  risk_score: number;
  created_at: string;
  sla_remaining: string;
  source_ips: string[];
  affected_assets: string[];
  mitre_attack: string[];
  summary: string;
  timeline?: Array<{ time: string; event: string; severity: string }>;
  evidence_items?: Array<{ title: string; detail: string; timestamp: string }>;
  suggested_actions?: Array<{ id: string; title: string; type: string; impact: string }>;
  applied_responses?: Array<{ action: string; target: string; status: string; timestamp: string; by: string }>;
  analyst_notes?: string[];
}

export interface FirewallRule {
  id: string;
  target_ip: string;
  port_range: string;
  protocol: string;
  action: 'DROP' | 'REJECT' | 'RATE_LIMIT';
  decision_source: string;
  created_at: string;
  expires_in_seconds: number;
  is_active: boolean;
  packets_dropped: number;
  verification_status: 'VERIFIED' | 'PENDING' | 'FAILED';
  rationale: string;
}

export interface NetworkTelemetry {
  bandwidth_mbps: number;
  packets_per_sec: number;
  active_flows: number;
  protocol_distribution: Record<string, number>;
  top_destinations: Array<{ asset: string; bandwidth: string; flows: number }>;
  recent_anomalies: Array<{ type: string; description: string; timestamp: string }>;
}

export interface IdentityUser {
  id: string;
  username: string;
  email: string;
  department: string;
  risk_score: number;
  mfa_enabled: boolean;
  active_sessions: number;
  last_location: string;
  anomalies_detected: number;
}

export interface IdentityAnomaly {
  id: string;
  user_email: string;
  anomaly_type: string;
  risk_score: number;
  severity: string;
  detected_at: string;
  details: string;
  action_taken: string;
}

export interface PhishingAnalysisResult {
  id: string;
  url_or_subject: string;
  classification: 'MALICIOUS_PHISHING' | 'PHISHING_MALICIOUS' | 'SUSPICIOUS' | 'CLEAN' | string;
  risk_score: number;
  confidence_pct: number;
  indicators: string[];
  domain_age_days: number;
  brand_impersonated?: string;
  recommended_action: string;
  analyzed_at: string;
  ai_summary?: string;
  is_aged_repurposed_domain?: boolean;
  days_since_update?: number;
  ssl_cert_age_days?: number;
  virustotal_flags?: string;
  virustotal_dossier?: any;
}

export interface MultimodalRecord {
  id: string;
  source_type: 'SMS' | 'EMAIL' | 'IMAGE_QR' | 'AUDIO_VOICE' | 'VIDEO_DEEPFAKE' | 'IMPERSONATION' | 'STATIC_MALWARE' | 'NETWORK_PCAP' | string;
  content_text?: string;
  media_url_or_name?: string;
  sender_metadata?: string;
  authenticity_score: number; // 0 - 100
  risk_score: number; // 0 - 100
  classification: string;
  verdict?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  threat_category?: string;
  ai_explanation?: string;
  impersonation_target?: string;
  impersonated_entity?: string;
  indicators: string[];
  technical_artifacts: Record<string, any>;
  recommended_action: string;
  analyzed_at: string;
}

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  evidence?: string[];
  mitre?: string[];
  recommended?: string[];
  grounded_evidence?: string[];
  mitre_references?: string[];
  recommended_actions?: string[];
  disclaimer?: string;
  model_used?: string;
  is_groq?: boolean;
  timestamp: string;
}

export interface AIChatResponseData {
  answer: string;
  grounded_evidence: string[];
  mitre_references: string[];
  recommended_actions: string[];
  disclaimer: string;
  model_used?: string;
  is_groq?: boolean;
}

export interface AIStatusData {
  qwen_ai_analyst_enabled: boolean;
  groq_configured: boolean;
  groq_model: string;
  groq_enabled: boolean;
  available_models: string[];
  default_engine: string;
}

export interface ThreatIntelIndicator {
  indicator: string;
  type: string;
  threat_actor: string;
  confidence: number;
  tlp: string;
  first_seen: string;
  last_seen: string;
  tags: string[];
}

export interface ResponseItem {
  id: string;
  action_name: string;
  target: string;
  decision_source: string;
  trigger_reason: string;
  executed_at: string;
  execution_time_ms: number;
  status: 'APPLIED_VERIFIED' | 'APPLIED' | 'IN_PROGRESS' | 'FAILED';
  verified_by: string;
  rollback_supported: boolean;
}

export interface SimulatorScenario {
  id: string;
  name: string;
  category: string;
  severity: string;
  description: string;
  targeted_subsystem: string;
  expected_outcome: string;
}

export interface SimulatorRunResult {
  execution_id: string;
  scenario_id: string;
  status: string;
  injected_events_count: number;
  generated_threat_id: string;
  generated_incident_id?: string;
  adaptive_rule_created?: string;
  response_verification_status: string;
  execution_log: string[];
}

export interface ServiceHealth {
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  latency_ms: number;
  details: string;
}

export interface SystemHealthData {
  overall_status: string;
  uptime_seconds: number;
  services: ServiceHealth[];
  system_metrics: {
    cpu_usage_pct: number;
    memory_usage_pct: number;
    network_throughput_gbps: number;
    inspected_packets_per_sec: number;
  };
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  decision_source: string;
  request_id: string;
  status: string;
  details: string;
}
