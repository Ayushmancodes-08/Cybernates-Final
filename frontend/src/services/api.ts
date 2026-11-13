import {
  UserProfile,
  DashboardSummary,
  ThreatItem,
  IncidentItem,
  FirewallRule,
  NetworkTelemetry,
  IdentityUser,
  IdentityAnomaly,
  PhishingAnalysisResult,
  MultimodalRecord,
  AIChatMessage,
  AIChatResponseData,
  AIStatusData,
  ThreatIntelIndicator,
  ResponseItem,
  SimulatorScenario,
  SimulatorRunResult,
  SystemHealthData,
  AuditLogItem
} from '../types';

const API_BASE_URL = typeof window !== 'undefined'
  ? (window.location.port === '8000' ? `http://${window.location.hostname}:8000/api/v1` : '/api/v1')
  : 'http://localhost:8000/api/v1';

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private activeTenantId: string = 'tenant-okcl-soc-01';

  constructor() {
    this.accessToken = localStorage.getItem('cyberguard_access_token');
    this.refreshToken = localStorage.getItem('cyberguard_refresh_token');
    const storedTenant = localStorage.getItem('cyberguard_tenant_id');
    if (storedTenant) {
      this.activeTenantId = storedTenant;
    }
  }

  public setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem('cyberguard_access_token', access);
    localStorage.setItem('cyberguard_refresh_token', refresh);
  }

  public clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('cyberguard_access_token');
    localStorage.removeItem('cyberguard_refresh_token');
  }

  public getTokens() {
    return { accessToken: this.accessToken, refreshToken: this.refreshToken };
  }

  public setTenant(tenantId: string) {
    this.activeTenantId = tenantId;
    localStorage.setItem('cyberguard_tenant_id', tenantId);
  }

  public getTenant(): string {
    return this.activeTenantId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': this.activeTenantId,
      ...(options.headers as Record<string, string> || {})
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(url, { ...options, headers });

    // Handle 401 with one-shot refresh attempt
    if (response.status === 401 && this.refreshToken && !endpoint.includes('/auth/')) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: this.refreshToken })
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          this.setTokens(refreshData.access_token, refreshData.refresh_token);
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          response = await fetch(url, { ...options, headers });
        } else {
          this.clearTokens();
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
      } catch (err) {
        this.clearTokens();
        window.location.href = '/login';
        throw err;
      }
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: response.statusText }));
      const msg = errorBody.detail?.message || errorBody.message || 'Request failed';
      throw new Error(msg);
    }

    return response.json();
  }

  // --- Auth ---
  async login(email: string, password: string, tenant_id?: string) {
    const data = await this.request<{ access_token: string; refresh_token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, tenant_id: tenant_id || this.activeTenantId })
    });
    this.setTokens(data.access_token, data.refresh_token);
    if (data.user?.active_tenant) {
      this.setTenant(data.user.active_tenant);
    }
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearTokens();
    }
  }

  async getMe(): Promise<UserProfile> {
    return this.request<UserProfile>('/me');
  }

  async getTenants() {
    return this.request<Array<{ id: string; name: string; region: string; tier: string; nodes: number }>>('/tenants');
  }

  async getUsers(): Promise<UserProfile[]> {
    return this.request<UserProfile[]>('/users');
  }

  // --- Dashboard ---
  async getDashboardSummary(): Promise<DashboardSummary> {
    return this.request<DashboardSummary>('/dashboard/summary');
  }

  // --- Threats ---
  async getLiveThreats(): Promise<ThreatItem[]> {
    return this.request<ThreatItem[]>('/threats/live');
  }

  async investigateThreat(threat_id: string): Promise<any> {
    return this.request<any>(`/threats/${threat_id}/investigate`);
  }

  async blockThreat(source_ip_or_obj: string | { source_ip?: string; threat_id?: string }) {
    const payload = typeof source_ip_or_obj === 'string' ? { source_ip: source_ip_or_obj } : source_ip_or_obj;
    return this.request('/threats/block', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async allowThreat(source_ip_or_obj: string | { source_ip?: string; threat_id?: string }) {
    const payload = typeof source_ip_or_obj === 'string' ? { source_ip: source_ip_or_obj } : source_ip_or_obj;
    return this.request('/threats/allow', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // --- Incidents ---
  async getIncidents(): Promise<IncidentItem[]> {
    return this.request<IncidentItem[]>('/incidents');
  }

  async getIncident(id: string): Promise<IncidentItem> {
    return this.request<IncidentItem>(`/incidents/${id}`);
  }

  async updateIncident(id: string, data: { status?: string; assigned_to?: string; notes?: string }) {
    return this.request<IncidentItem>(`/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // --- Adaptive Firewall ---
  async getFirewallRules(): Promise<FirewallRule[]> {
    return this.request<FirewallRule[]>('/firewall/rules');
  }

  async createFirewallRule(rule: { target_ip: string; port_range?: string; protocol?: string; action?: string; duration_minutes?: number; rationale: string }) {
    return this.request<FirewallRule>('/firewall/rules', {
      method: 'POST',
      body: JSON.stringify(rule)
    });
  }

  async deleteFirewallRule(rule_id: string) {
    return this.request(`/firewall/rules/${rule_id}`, { method: 'DELETE' });
  }

  async investigateFirewallRule(rule_id: string) {
    return this.request<any>(`/firewall/rules/${rule_id}/investigate`);
  }

  async toggleFirewall() {
    return this.request<{ auto_mitigation_enabled: boolean }>('/firewall/toggle', { method: 'POST' });
  }

  // --- Network Intelligence ---
  async getNetworkTelemetry(): Promise<NetworkTelemetry> {
    return this.request<NetworkTelemetry>('/network/telemetry');
  }

  async explainNetworkPacket(data: {
    ip: string;
    packet_id?: number;
    protocol?: string;
    status?: string;
    info?: string;
    destination?: string;
    application_layer?: string;
    payload_ascii?: string;
  }): Promise<any> {
    return this.request<any>('/network/explain-packet', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // --- Identity Security ---
  async getIdentityUsers(): Promise<IdentityUser[]> {
    return this.request<IdentityUser[]>('/identity/users');
  }

  async getIdentityAnomalies(): Promise<IdentityAnomaly[]> {
    return this.request<IdentityAnomaly[]>('/identity/anomalies');
  }

  async revokeSession(email: string) {
    return this.request('/identity/revoke-session', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // --- Phishing Analysis ---
  async getPhishingHistory(): Promise<PhishingAnalysisResult[]> {
    return this.request<PhishingAnalysisResult[]>('/phishing/history');
  }

  async analyzePhishing(url_or_content: string, target_user?: string): Promise<PhishingAnalysisResult> {
    return this.request<PhishingAnalysisResult>('/phishing/analyze', {
      method: 'POST',
      body: JSON.stringify({ url_or_content, target_user })
    });
  }

  // --- Multimodal & Deepfake Analysis ---
  async getMultimodalRecords(): Promise<MultimodalRecord[]> {
    return this.request<MultimodalRecord[]>('/multimodal/records');
  }

  async analyzeMultimodal(req: { source_type: string; content_text?: string; media_url_or_name?: string; sender_metadata?: string; impersonation_target?: string }): Promise<MultimodalRecord> {
    return this.request<MultimodalRecord>('/multimodal/analyze', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }

  async uploadAndAnalyzeMedia(file: File, impersonationTarget?: string, contentText?: string): Promise<MultimodalRecord> {
    const formData = new FormData();
    formData.append('file', file);
    if (impersonationTarget) formData.append('impersonation_target', impersonationTarget);
    if (contentText) formData.append('content_text', contentText);

    const headers: Record<string, string> = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    if (this.activeTenantId) {
      headers['X-Tenant-ID'] = this.activeTenantId;
    }

    const response = await fetch(`${API_BASE_URL}/multimodal/upload-and-analyze`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Upload and analysis failed' }));
      throw new Error(err.detail || 'Upload and analysis failed');
    }

    return response.json();
  }

  // --- AI Analyst ---
  async askAI(
    query: string,
    context_incident_id?: string,
    context_threat_id?: string,
    conversation_history?: Array<{ role: string; content: string }>,
    groq_api_key?: string,
    model?: string
  ): Promise<AIChatResponseData> {
    return this.request<AIChatResponseData>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        query,
        context_incident_id,
        context_threat_id,
        conversation_history,
        groq_api_key,
        model
      })
    });
  }

  async getAIStatus(): Promise<AIStatusData> {
    return this.request<AIStatusData>('/ai/status');
  }

  // --- Threat Intelligence ---
  async getThreatIndicators(): Promise<ThreatIntelIndicator[]> {
    return this.request<ThreatIntelIndicator[]>('/threat-intel/indicators');
  }

  async getThreatFeeds() {
    return this.request<Array<{ id?: string; name: string; status: string; indicators_count: number; last_updated: string; feed_type?: string; recent_attacks?: any[] }>>('/threat-intel/feeds');
  }

  async syncKnnThreatIntelligence(feeds?: string[]) {
    return this.request<{
      status: string;
      synced_at: string;
      indicators_added: number;
      total_active_indicators: number;
      knn_model_status: any;
      message: string;
    }>('/threat-intel/sync-knn', {
      method: 'POST',
      body: JSON.stringify({ feeds: feeds || [] })
    });
  }

  // --- Response Center ---
  async getResponses(): Promise<ResponseItem[]> {
    return this.request<ResponseItem[]>('/responses');
  }

  async executeResponse(action_type: string, target: string, reason: string): Promise<ResponseItem> {
    return this.request<ResponseItem>('/responses/execute', {
      method: 'POST',
      body: JSON.stringify({ action_type, target, reason })
    });
  }

  async verifyResponse(response_id: string) {
    return this.request(`/responses/${response_id}/verify`, { method: 'POST' });
  }

  // --- Attack Simulator ---
  async getSimulatorScenarios(): Promise<SimulatorScenario[]> {
    return this.request<SimulatorScenario[]>('/simulator/scenarios');
  }

  async runSimulator(scenario_id: string, target_asset?: string): Promise<SimulatorRunResult> {
    return this.request<SimulatorRunResult>('/simulator/run', {
      method: 'POST',
      body: JSON.stringify({ scenario_id, target_asset })
    });
  }

  // --- System Health ---
  async getSystemHealth(): Promise<SystemHealthData> {
    return this.request<SystemHealthData>('/health/detailed');
  }

  // --- Audit Logs ---
  async getAuditLogs(): Promise<AuditLogItem[]> {
    return this.request<AuditLogItem[]>('/audit-logs');
  }

  // --- Circle Defense & In-Line Relay ---
  async getCircleMembers() {
    return this.request<{ status: string; members: any[]; total_protected: number; mesh_status: string; total_attacks_neutralized: number; synced_signatures_count: number }>('/circle/members');
  }

  async addCircleMember(member: { name: string; phone: string; relationship?: string; risk_tier?: string; device_label?: string }) {
    return this.request<{ status: string; message: string; member: any }>('/circle/add', {
      method: 'POST',
      body: JSON.stringify(member)
    });
  }

  async removeCircleMember(memberId: string) {
    return this.request<{ status: string; message: string }>(`/circle/remove/${memberId}`, {
      method: 'DELETE'
    });
  }

  async getCircleAlerts() {
    return this.request<{ status: string; alerts: any[] }>('/circle/alerts');
  }

  async simulateCircleAttack(targetMemberName: string = 'Deepak Mohanty (Father)', attackType: string = 'SBI_SMISHING') {
    return this.request<{ status: string; message: string; alert: any }>('/circle/simulate-attack', {
      method: 'POST',
      body: JSON.stringify({ target_member_name: targetMemberName, attack_type: attackType })
    });
  }

  async interceptScamCall(payload: {
    caller_id?: string;
    caller_name?: string;
    victim_name?: string;
    victim_phone?: string;
    scam_vector?: string;
    audio_transcript?: string;
    dtmf_digits_pressed?: string;
    otp_blocked?: boolean;
  }) {
    return this.request<{ status: string; action: string; message: string; threat_id: string; alert: any }>('/call/intercept', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getRelayMessages() {
    return this.request<{ messages: any[]; threats: any[]; client_ip: string; total_delivered: number; total_intercepted: number }>('/relay/messages');
  }

  async clearRelayMessages() {
    return this.request<{ status: string; message: string }>('/relay/clear', { method: 'POST' });
  }

  async sendRelayMessage(payload: { text?: string; media_type?: string; channel?: string; email_subject?: string; email_sender_name?: string }) {
    return this.request<{ status: string; delivered: boolean; is_threat: boolean; message?: any; threat?: any }>('/relay/send', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async unblockLiveIngress(ip: string) {
    return this.request<{ status: string; message: string; ip: string }>('/live-ingress/unblock', {
      method: 'POST',
      body: JSON.stringify({ ip })
    });
  }

  // --- Settings ---
  async getSettings() {
    return this.request<Record<string, any>>('/settings');
  }

  async updateSettings(settings: Record<string, any>) {
    return this.request('/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings)
    });
  }
}

export const api = new ApiService();
