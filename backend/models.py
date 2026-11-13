from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth & User Models ---
class LoginRequest(BaseModel):
    email: str
    password: str
    tenant_id: Optional[str] = "tenant-okcl-soc-01"

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 3600
    user: Dict[str, Any]

class RefreshRequest(BaseModel):
    refresh_token: str

class UserProfile(BaseModel):
    id: str
    email: str
    name: str
    role: str # "admin", "analyst", "viewer"
    title: str
    avatar: Optional[str] = None
    memberships: List[Dict[str, str]]
    active_tenant: str
    permissions: List[str]

# --- Dashboard & Telemetry Models ---
class PostureMetrics(BaseModel):
    overall_score: int
    status: str
    summary_text: str
    network_score: int
    identity_score: int
    adaptive_fw_score: int
    threat_defense_score: int

class MetricCard(BaseModel):
    title: str
    value: str
    subtitle: str
    badge_text: str
    badge_variant: str # "info", "success", "warning", "critical"

class DashboardSummaryResponse(BaseModel):
    posture: PostureMetrics
    metrics: List[MetricCard]
    severity_distribution: Dict[str, int]
    vector_distribution: Dict[str, int]
    activity_timeline: List[Dict[str, Any]]
    recent_incidents: List[Dict[str, Any]]
    active_threats_preview: List[Dict[str, Any]]

# --- Threat & Finding Models ---
class ThreatItem(BaseModel):
    id: str
    source_ip: str
    destination: str
    vector: str
    severity: str # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    risk_score: int
    status: str # "ACTIVE", "CONTAINED", "BLOCKED", "TRIAGING"
    decision_source: str # "AUTONOMOUS_POLICY", "ANALYST_MANUAL", "RATE_LIMITER"
    timestamp: str
    evidence: List[str]
    mitre_technique: Optional[str] = None
    packet_rate: Optional[str] = None

class FindingItem(BaseModel):
    id: str
    title: str
    category: str
    asset_id: str
    risk_score: int
    severity: str
    status: str
    created_at: str
    description: str
    evidence: List[str]

# --- Incident Models ---
class IncidentItem(BaseModel):
    id: str
    incident_number: str # e.g. "INC-1042"
    title: str
    severity: str
    status: str # "TRIAGE", "INVESTIGATING", "CONTAINED", "RESOLVED"
    assigned_to: str
    risk_score: int
    created_at: str
    sla_remaining: str
    source_ips: List[str]
    affected_assets: List[str]
    mitre_attack: List[str]
    summary: str

class IncidentDetail(IncidentItem):
    timeline: List[Dict[str, Any]]
    evidence_items: List[Dict[str, Any]]
    suggested_actions: List[Dict[str, Any]]
    applied_responses: List[Dict[str, Any]]
    analyst_notes: List[str]

# --- Adaptive Firewall Models ---
class FirewallRule(BaseModel):
    id: str
    target_ip: str
    port_range: str
    protocol: str
    action: str # "DROP", "REJECT", "RATE_LIMIT"
    decision_source: str # "DETERMINISTIC_POLICY", "SURICATA_AUTO", "MANUAL"
    created_at: str
    expires_in_seconds: int
    is_active: bool
    packets_dropped: int
    verification_status: str # "VERIFIED", "PENDING", "FAILED"
    rationale: str

class FirewallRuleCreate(BaseModel):
    target_ip: str
    port_range: str = "ALL"
    protocol: str = "TCP/UDP"
    action: str = "DROP"
    duration_minutes: int = 60
    rationale: str

# --- Network Intelligence Models ---
class NetworkTelemetry(BaseModel):
    bandwidth_mbps: float
    packets_per_sec: int
    active_flows: int
    protocol_distribution: Dict[str, float]
    top_destinations: List[Dict[str, Any]]
    recent_anomalies: List[Dict[str, Any]]

# --- Identity Security Models ---
class IdentityUser(BaseModel):
    id: str
    username: str
    email: str
    department: str
    risk_score: int
    mfa_enabled: bool
    active_sessions: int
    last_location: str
    anomalies_detected: int

class IdentityAnomaly(BaseModel):
    id: str
    user_email: str
    anomaly_type: str # "IMPOSSIBLE_TRAVEL", "UNUSUAL_ASN", "BRUTE_FORCE", "PRIVILEGE_SPIKE"
    risk_score: int
    severity: str
    detected_at: str
    details: str
    action_taken: str

# --- Phishing Analysis Models ---
class PhishingAnalysisRequest(BaseModel):
    url_or_content: Optional[str] = None
    url: Optional[str] = None
    sender_email: Optional[str] = None
    target_user: Optional[str] = None

    def get_target(self) -> str:
        return (self.url_or_content or self.url or "").strip()

class PhishingAnalysisResult(BaseModel):
    id: str
    url_or_subject: str
    classification: str # "MALICIOUS_PHISHING", "SUSPICIOUS", "CLEAN"
    risk_score: int
    confidence_pct: float
    indicators: List[str]
    domain_age_days: int
    brand_impersonated: Optional[str] = None
    recommended_action: str # "QUARANTINE_AND_BLOCK_DOMAIN", "WARN_USER", "ALLOW"
    analyzed_at: str
    ai_summary: Optional[str] = None
    is_aged_repurposed_domain: Optional[bool] = False
    days_since_update: Optional[int] = None
    ssl_cert_age_days: Optional[int] = None
    virustotal_flags: Optional[str] = None
    virustotal_dossier: Optional[Dict[str, Any]] = None

# --- Multimodal & Deepfake Threat Models ---
class MultimodalAnalysisRequest(BaseModel):
    source_type: str # "SMS", "EMAIL", "IMAGE_QR", "AUDIO_VOICE", "VIDEO_DEEPFAKE", "IMPERSONATION"
    content_text: Optional[str] = None
    media_url_or_name: Optional[str] = None
    sender_metadata: Optional[str] = None
    impersonation_target: Optional[str] = None

class MultimodalAnalysisResult(BaseModel):
    id: str
    source_type: str
    authenticity_score: float # 0-100 (100 = Authentic, 0 = High Deepfake/Fake probability)
    risk_score: int # 0-100
    classification: str # "DEEPFAKE_MANIPULATED", "SMISHING_FRAUD", "SPEAR_PHISHING", "VIP_IMPERSONATION", "AUTHENTIC"
    impersonated_entity: Optional[str] = None
    indicators: List[str]
    technical_artifacts: Dict[str, Any]
    recommended_action: str
    analyzed_at: str

# --- AI Security Analyst Models ---
class AIChatRequest(BaseModel):
    query: str
    context_incident_id: Optional[str] = None
    context_threat_id: Optional[str] = None
    conversation_history: Optional[List[Dict[str, str]]] = None
    groq_api_key: Optional[str] = None
    model: Optional[str] = None

class AIChatResponse(BaseModel):
    answer: str
    grounded_evidence: List[str]
    mitre_references: List[str]
    recommended_actions: List[str]
    disclaimer: str = "AI Analyst is advisory. Enforcement is governed deterministically by Policy Engine."
    model_used: Optional[str] = "Qwen 2.5 Local Telemetry Engine"
    is_groq: Optional[bool] = False

# --- Threat Intelligence Models ---
class ThreatIntelIndicator(BaseModel):
    indicator: str
    type: str # "IP", "DOMAIN", "SHA256"
    threat_actor: str
    confidence: int
    tlp: str # "WHITE", "GREEN", "AMBER", "RED"
    first_seen: str
    last_seen: str
    tags: List[str]

# --- Response Center Models ---
class ResponseItem(BaseModel):
    id: str
    action_name: str # e.g. "NFTABLES_DROP_IP", "REVOKE_SESSION", "QUARANTINE_EMAIL"
    target: str
    decision_source: str
    trigger_reason: str
    executed_at: str
    execution_time_ms: int
    status: str # "APPLIED_VERIFIED", "APPLIED", "IN_PROGRESS", "FAILED"
    verified_by: str
    rollback_supported: bool

class ResponseExecutionRequest(BaseModel):
    action_type: str
    target: str
    reason: str

# --- Attack Simulator Models ---
class SimulatorScenario(BaseModel):
    id: str
    name: str
    category: str
    severity: str
    description: str
    targeted_subsystem: str
    expected_outcome: str

class SimulatorRunRequest(BaseModel):
    scenario_id: str
    target_asset: Optional[str] = "192.168.1.100 (OKCL Core Gateway)"

class SimulatorRunResult(BaseModel):
    execution_id: str
    scenario_id: str
    status: str
    injected_events_count: int
    generated_threat_id: str
    generated_incident_id: Optional[str] = None
    adaptive_rule_created: Optional[str] = None
    response_verification_status: str
    execution_log: List[str]

# --- System Health Models ---
class ServiceHealth(BaseModel):
    name: str
    status: str # "HEALTHY", "DEGRADED", "OFFLINE"
    latency_ms: float
    details: str

class SystemHealthDetailed(BaseModel):
    overall_status: str
    uptime_seconds: int
    services: List[ServiceHealth]
    system_metrics: Dict[str, Any]

# --- Audit Log Models ---
class AuditLogItem(BaseModel):
    id: str
    timestamp: str
    actor: str
    role: str
    action: str
    target: str
    decision_source: str
    request_id: str
    status: str
    details: str

# --- Settings ---
class SettingsConfig(BaseModel):
    auto_mitigation_enabled: bool = True
    risk_threshold_auto_block: int = 85
    rule_default_ttl_minutes: int = 60
    suricata_ids_mode: str = "INLINE_PREVENTION"
    qwen_ai_analyst_enabled: bool = True
    notification_webhook: str = "https://hooks.cyberguard.internal/alerts"
    tenant_name: str = "CyberGuard SOC - Primary"
    groq_api_key: Optional[str] = None
    groq_model: str = "llama-3.3-70b-versatile"
    groq_enabled: bool = True

# --- Multimodal Threat Models (Problem Statement 9) ---
class MultimodalAnalysisRequest(BaseModel):
    source_type: str
    content_text: Optional[str] = None
    media_url_or_name: Optional[str] = None
    sender_metadata: Optional[str] = None
    impersonation_target: Optional[str] = None

class MultimodalRecordItem(BaseModel):
    id: str
    source_type: str
    content_text: Optional[str] = None
    media_url_or_name: Optional[str] = None
    sender_metadata: Optional[str] = None
    authenticity_score: float
    risk_score: int
    classification: str
    verdict: Optional[str] = "MALICIOUS"
    severity: Optional[str] = "CRITICAL"
    threat_category: Optional[str] = None
    impersonation_target: Optional[str] = None
    impersonated_entity: Optional[str] = None
    ai_explanation: Optional[str] = None
    indicators: List[str] = []
    technical_artifacts: Dict[str, Any] = {}
    recommended_action: str
    analyzed_at: str

MultimodalAnalysisResult = MultimodalRecordItem
