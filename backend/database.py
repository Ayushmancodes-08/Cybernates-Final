import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional
from security import hash_password

class InMemoryStore:
    def __init__(self):
        self.reset_data()

    def reset_data(self):
        # 1. Users
        self.users: Dict[str, Dict[str, Any]] = {
            "elena.vance@cyberguard.internal": {
                "id": "usr-admin-01",
                "email": "elena.vance@cyberguard.internal",
                "name": "Elena Vance",
                "password_hash": hash_password("CyberGuard@2026!Admin"),
                "role": "admin",
                "title": "Lead Security Architect",
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80",
                "active_tenant": "tenant-okcl-soc-01",
                "memberships": [
                    {"id": "tenant-okcl-soc-01", "name": "CyberGuard SOC - Primary (Odisha)"},
                    {"id": "tenant-okcl-edu-02", "name": "OKCL State Education Grid"},
                    {"id": "tenant-okcl-gov-03", "name": "Odisha eGovernance Cloud"}
                ],
                "permissions": ["all", "firewall:write", "users:write", "incidents:write", "responses:execute", "system:configure"]
            },
            "marcus.chen@cyberguard.internal": {
                "id": "usr-analyst-02",
                "email": "marcus.chen@cyberguard.internal",
                "name": "Marcus Chen",
                "password_hash": hash_password("CyberGuard@2026!Analyst"),
                "role": "analyst",
                "title": "Senior SOC Analyst",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80",
                "active_tenant": "tenant-okcl-soc-01",
                "memberships": [
                    {"id": "tenant-okcl-soc-01", "name": "CyberGuard SOC - Primary (Odisha)"},
                    {"id": "tenant-okcl-edu-02", "name": "OKCL State Education Grid"}
                ],
                "permissions": ["incidents:read", "incidents:write", "firewall:read", "firewall:write", "responses:execute", "findings:write"]
            },
            "sarah.jenkins@cyberguard.internal": {
                "id": "usr-viewer-03",
                "email": "sarah.jenkins@cyberguard.internal",
                "name": "Sarah Jenkins",
                "password_hash": hash_password("CyberGuard@2026!Viewer"),
                "role": "viewer",
                "title": "Security Auditor",
                "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&auto=format&fit=crop&q=80",
                "active_tenant": "tenant-okcl-soc-01",
                "memberships": [
                    {"id": "tenant-okcl-soc-01", "name": "CyberGuard SOC - Primary (Odisha)"}
                ],
                "permissions": ["incidents:read", "firewall:read", "threats:read", "audit:read"]
            }
        }

        # 2. Tenants
        self.tenants = [
            {"id": "tenant-okcl-soc-01", "name": "CyberGuard SOC - Primary (Odisha)", "region": "Asia-South1 (Bhubaneswar)", "tier": "Enterprise Critical", "nodes": 128},
            {"id": "tenant-okcl-edu-02", "name": "OKCL State Education Grid", "region": "Asia-South1", "tier": "Public Infrastructure", "nodes": 84},
            {"id": "tenant-okcl-gov-03", "name": "Odisha eGovernance Cloud", "region": "Asia-South1", "tier": "Government Tier-4", "nodes": 210}
        ]

        # 3. Live Threats (Awaiting Operator Triage Review & Ingress Queue)
        self.threats: List[Dict[str, Any]] = [
            {
                "id": "THR-9041",
                "source_ip": "103.212.45.19",
                "destination": "10.0.12.44 (OKCL Student Gateway)",
                "vector": "WhatsApp Phishing URL Credential Harvest",
                "severity": "CRITICAL",
                "risk_score": 98,
                "status": "AWAITING_REVIEW",
                "review_status": "AWAITING_ANALYST_REVIEW",
                "decision_source": "HEURISTIC_SURICATA",
                "timestamp": "2026-11-12T18:40:12Z",
                "mitre_technique": "T1566.002 - Spearphishing Link",
                "packet_rate": "84 pkts/sec",
                "evidence": ["Unregistered domain 'scholarship-grant.xyz' mimicking state portal", "High Shannon lexical entropy 4.82"],
                "qwen_analysis": (
                    "QWEN 2.5 ANALYST SUMMARY:\n"
                    "• Security Event & Reason: Intercepted inbound WhatsApp phishing link from 103.212.45.19 targeting student login credentials.\n"
                    "• Detected Behavioral Anomaly: Unregistered typosquatted domain (.xyz) with high lexical entropy and deceptive grant verification parameters.\n"
                    "• Enforcement Action: Recommended immediate kernel eBPF DROP rule to isolate host IP."
                )
            },
            {
                "id": "THR-9042",
                "source_ip": "185.220.101.42",
                "destination": "10.0.8.12 (VoIP SIP Gateway)",
                "vector": "Synthetic AI Voice Clone BEC Impersonation",
                "severity": "CRITICAL",
                "risk_score": 96,
                "status": "AWAITING_REVIEW",
                "review_status": "AWAITING_ANALYST_REVIEW",
                "decision_source": "RAWNET2_VOCODER",
                "timestamp": "2026-11-12T18:35:50Z",
                "mitre_technique": "T1566 - Voice Deepfake BEC",
                "packet_rate": "VoIP SIP Stream",
                "evidence": ["High-frequency spectral roll-off anomaly > 8,150 Hz", "Pitch variance standard deviation flatline 4.2 Hz"],
                "qwen_analysis": (
                    "QWEN 2.5 ANALYST SUMMARY:\n"
                    "• Security Event & Reason: Inbound VoIP SIP audio stream flagged as synthetic neural vocoder speech clone targeting executive wire authorization.\n"
                    "• Detected Behavioral Anomaly: Spectral cutoff at 8,150 Hz and flat F0 pitch standard deviation (4.2 Hz) characteristic of multi-band MelGAN neural vocoders.\n"
                    "• Enforcement Action: SIP trunk origin dropped and executive credentials locked with zero packet leakage."
                )
            },
            {
                "id": "THR-9043",
                "source_ip": "45.154.255.89",
                "destination": "10.0.12.80 (Examination Cell)",
                "vector": "Campus Notice Board Quishing QR Redirect",
                "severity": "CRITICAL",
                "risk_score": 92,
                "status": "AWAITING_REVIEW",
                "review_status": "AWAITING_ANALYST_REVIEW",
                "decision_source": "CV_OCR_QR_SCANNER",
                "timestamp": "2026-11-12T18:30:15Z",
                "mitre_technique": "T1566.002 - QR Quishing Redirection",
                "packet_rate": "12 pkts/sec",
                "evidence": ["Decoded QR payload: https://okcl-exam-fee.online/verify", "Domain registered 4 days ago with DLT header mismatch"],
                "qwen_analysis": (
                    "QWEN 2.5 ANALYST SUMMARY:\n"
                    "• Security Event & Reason: Decoded optical QR code payload leading to unauthorized fee collection portal.\n"
                    "• Detected Behavioral Anomaly: Embedded URL points to a newly registered .online domain masquerading as official state portal with spoofed DLT header.\n"
                    "• Enforcement Action: Decoded URL injected into adaptive firewall perimeter DROP table in 0.42 μs."
                )
            },
            {
                "id": "THR-9044",
                "source_ip": "192.168.1.105",
                "destination": "10.0.4.15 (Citizen SMS Ingress)",
                "vector": "Urgent Banking SMS Smishing OTP Harvest",
                "severity": "HIGH",
                "risk_score": 88,
                "status": "AWAITING_REVIEW",
                "review_status": "AWAITING_ANALYST_REVIEW",
                "decision_source": "NLP_LOGISTIC_REGRESSION",
                "timestamp": "2026-11-12T18:24:00Z",
                "mitre_technique": "T1566.002 - SMS Smishing Fraud",
                "packet_rate": "SMS Ingress Gateway",
                "evidence": ["Urgency token 'disbursement on hold'", "Fraudulent KYC redirection URL: https://sbi-kyc-okcl.top"],
                "qwen_analysis": (
                    "QWEN 2.5 ANALYST SUMMARY:\n"
                    "• Security Event & Reason: Inbound SMS smishing message attempting credential coercion and fraudulent OTP harvesting.\n"
                    "• Detected Behavioral Anomaly: High urgency trigger tokens ('account blockage', 'update KYC within 30 mins') coupled with deceptive top-level domain (.top).\n"
                    "• Enforcement Action: In-line packet dropped before delivery to recipient client. Attacker SMS gateway throttled."
                )
            }
        ]

        # 4. Incidents
        self.incidents: List[Dict[str, Any]] = [
            {
                "id": "inc-1042",
                "incident_number": "INC-1042",
                "title": "Coordinated Port Scan & SSH Brute-Force from Tor Outpost",
                "severity": "CRITICAL",
                "status": "INVESTIGATING",
                "assigned_to": "Elena Vance",
                "risk_score": 94,
                "created_at": "2026-09-19T12:28:10Z",
                "sla_remaining": "00:42:15",
                "source_ips": ["185.220.101.42", "45.154.255.89"],
                "affected_assets": ["10.0.12.44 (OKCL Portal)", "10.0.8.12 (Bastion)"],
                "mitre_attack": ["T1046", "T1110.001", "T1090.003"],
                "summary": (
                    "QWEN 2.5 ANALYST SUMMARY:\n"
                    "• Security Event & Reason: Distributed network reconnaissance detected across gateway segments, immediately followed by credential brute forcing against SSH bastions.\n"
                    "• Detected Behavioral Anomaly: Rapid TCP SYN port sweep across ports 22, 80, 443 with Tor exit consensus fingerprint E79F4B3C.\n"
                    "• Enforcement Action: Automated adaptive firewall policy executed DROP action with 60-minute expiry (Rule #FW-9041 verified in kernel netlink)."
                ),
                "timeline": [
                    {"time": "12:28:10", "event": "Rapid port probe detected by Suricata on 10.0.12.44 (Ports 22, 80, 443, 3389, 8080)", "severity": "MEDIUM"},
                    {"time": "12:28:22", "event": "Risk Engine evaluated telemetry: Risk Score calculated as 94/100", "severity": "HIGH"},
                    {"time": "12:28:25", "event": "Deterministic Policy Engine triggered: Auto-DROP rule synthesized for 185.220.101.42", "severity": "CRITICAL"},
                    {"time": "12:28:26", "event": "nftables updated: Rule #FW-9041 verified active (0 packet bypass)", "severity": "SUCCESS"},
                    {"time": "12:29:45", "event": "Secondary origin 45.154.255.89 attempted SSH brute force against bastion", "severity": "HIGH"},
                    {"time": "12:30:00", "event": "Qwen AI Analyst correlated both origins to common Tor exit family", "severity": "INFO"}
                ],
                "evidence_items": [
                    {"title": "Suricata Alert Log", "detail": "ET SCAN Potential SSH Scan 185.220.101.42 -> 10.0.8.12", "timestamp": "12:28:10"},
                    {"title": "Flow Telemetry", "detail": "8,420 SYN packets transmitted with 0 ACK replies received", "timestamp": "12:28:12"},
                    {"title": "Tor Exit Node Database", "detail": "IP matches Tor consensus relay Fingerprint: E79F4B3C", "timestamp": "12:28:15"},
                    {"title": "nftables Verification Receipt", "detail": "Hash: c4ca4238a0b923820dcc509a6f75849b (Rule verified via kernel netlink socket)", "timestamp": "12:28:26"}
                ],
                "suggested_actions": [
                    {"id": "act-1", "title": "Extend IP Quarantine to 24 Hours", "type": "firewall", "impact": "Zero legitimate user traffic from this IP"},
                    {"id": "act-2", "title": "Force MFA Re-authentication for Bastion Admins", "type": "identity", "impact": "Will invalidate 3 active admin sessions"},
                    {"id": "act-3", "title": "Export STIX 2.1 Threat Report to OKCL SOC", "type": "intel", "impact": "Inform state cybersecurity center"}
                ],
                "applied_responses": [
                    {"action": "NFTABLES_DROP_IP", "target": "185.220.101.42", "status": "VERIFIED", "timestamp": "12:28:26", "by": "PolicyEngine-Auto"},
                    {"action": "NFTABLES_DROP_IP", "target": "45.154.255.89", "status": "VERIFIED", "timestamp": "12:30:05", "by": "PolicyEngine-Auto"}
                ],
                "analyst_notes": [
                    "Elena Vance (12:32:00): Primary IP neutralized. Correlating secondary logs across the education portal."
                ]
            },
            {
                "id": "inc-1041",
                "incident_number": "INC-1041",
                "title": "Credential Stuffing & Session Anomaly on Employee Portal",
                "severity": "HIGH",
                "status": "CONTAINED",
                "assigned_to": "Marcus Chen",
                "risk_score": 87,
                "created_at": "2026-09-19T11:45:00Z",
                "sla_remaining": "01:15:00",
                "source_ips": ["198.51.100.24"],
                "affected_assets": ["Auth Identity Service", "User: deepak.mohanty@okcl.org"],
                "mitre_attack": ["T1110.004", "T1078.003"],
                "summary": "Simultaneous logins from Bhubaneswar and Frankfurt within 4 minutes. Identity anomaly engine flagged Impossible Travel and revoked active refresh tokens.",
                "timeline": [
                    {"time": "11:45:00", "event": "Login attempt from Frankfurt (AS24940)", "severity": "MEDIUM"},
                    {"time": "11:46:12", "event": "Impossible travel calculation: 6,800 km in 4 minutes (Velocity 102,000 km/h)", "severity": "HIGH"},
                    {"time": "11:46:15", "event": "Identity Policy: Session tokens revoked & account locked pending MFA challenge", "severity": "SUCCESS"}
                ],
                "evidence_items": [
                    {"title": "GeoIP Discrepancy", "detail": "Origin A: 122.176.45.12 (Bhubaneswar) | Origin B: 198.51.100.24 (Frankfurt)", "timestamp": "11:45:00"}
                ],
                "suggested_actions": [],
                "applied_responses": [
                    {"action": "REVOKE_ALL_SESSIONS", "target": "deepak.mohanty@okcl.org", "status": "VERIFIED", "timestamp": "11:46:15", "by": "IdentityGuard-Auto"}
                ],
                "analyst_notes": ["Marcus Chen: User notified via backup telephone verification. Credentials rotated."]
            },
            {
                "id": "inc-1040",
                "incident_number": "INC-1040",
                "title": "Sophisticated Phishing Masquerade targeting OKCL Payroll",
                "severity": "CRITICAL",
                "status": "CONTAINED",
                "assigned_to": "Elena Vance",
                "risk_score": 96,
                "created_at": "2026-09-19T10:12:00Z",
                "sla_remaining": "Resolved",
                "source_ips": ["91.240.118.17"],
                "affected_assets": ["Mail Gateway", "OKCL HR Department"],
                "mitre_attack": ["T1566.002", "T1204.001"],
                "summary": "Inbound spear phishing email with lookalike domain okcl-payroll.support-portal.top. Phishing classifier model scored 96% malicious. Inbound mail quarantined at gateway.",
                "timeline": [
                    {"time": "10:12:00", "event": "Inbound SMTP connection from 91.240.118.17", "severity": "LOW"},
                    {"time": "10:12:04", "event": "Phishing Analyzer parsed header and embedded link: homoglyphs detected", "severity": "CRITICAL"},
                    {"time": "10:12:05", "event": "Message quarantined and domain blacklisted across corporate DNS", "severity": "SUCCESS"}
                ],
                "evidence_items": [
                    {"title": "URL Analysis", "detail": "Domain registered 48h ago. Fake Microsoft login CSS template embedded.", "timestamp": "10:12:04"}
                ],
                "suggested_actions": [],
                "applied_responses": [
                    {"action": "QUARANTINE_EMAIL_MESSAGE", "target": "msg-id-99410-okcl", "status": "VERIFIED", "timestamp": "10:12:05", "by": "PhishGuard-Auto"}
                ],
                "analyst_notes": ["Clean containment. Zero employees clicked."]
            },
            {
                "id": "inc-1039",
                "incident_number": "INC-1039",
                "title": "Internal Workstation SMB Lateral Movement Attempt",
                "severity": "HIGH",
                "status": "RESOLVED",
                "assigned_to": "Marcus Chen",
                "risk_score": 79,
                "created_at": "2026-09-19T08:30:00Z",
                "sla_remaining": "Resolved",
                "source_ips": ["192.168.10.88"],
                "affected_assets": ["10.0.1.20 (Finance File Share)"],
                "mitre_attack": ["T1021.002"],
                "summary": "Contractor laptop scanned SMB ports across finance VLAN. Host quarantined to remediation network.",
                "timeline": [],
                "evidence_items": [],
                "suggested_actions": [],
                "applied_responses": [],
                "analyst_notes": ["Remediated by endpoint agent."]
            },
            {
                "id": "inc-1038",
                "incident_number": "INC-1038",
                "title": "DNS Amplification & UDP Reflected Flood",
                "severity": "MEDIUM",
                "status": "CONTAINED",
                "assigned_to": "Elena Vance",
                "risk_score": 68,
                "created_at": "2026-09-19T07:15:00Z",
                "sla_remaining": "Resolved",
                "source_ips": ["178.62.204.19"],
                "affected_assets": ["10.0.12.53 (Authoritative DNS Core)"],
                "mitre_attack": ["T1498.002"],
                "summary": "Volumetric spoofed UDP ANY queries mitigated by Suricata auto rate limiter on port 53.",
                "timeline": [],
                "evidence_items": [
                    {"title": "UDP Flood Log", "detail": "45,190 pkts/sec rate limited by eBPF netfilter hook", "timestamp": "07:15:02"}
                ],
                "suggested_actions": [],
                "applied_responses": [
                    {"action": "RATE_LIMIT_UDP_53", "target": "178.62.204.19", "status": "VERIFIED", "timestamp": "07:15:05", "by": "Suricata-Auto"}
                ],
                "analyst_notes": ["Bandwidth consumption normalized under 15 Mbps."]
            }
        ]

        # 5. Adaptive Firewall Rules
        self.firewall_rules: List[Dict[str, Any]] = [
            {
                "id": "FW-9041",
                "target_ip": "185.220.101.42",
                "port_range": "ALL",
                "protocol": "TCP/UDP",
                "action": "DROP",
                "decision_source": "DETERMINISTIC_POLICY",
                "created_at": "2026-09-19T12:28:25Z",
                "expires_in_seconds": 3215,
                "is_active": True,
                "packets_dropped": 14280,
                "verification_status": "VERIFIED",
                "rationale": "High-frequency port scan anomaly (INC-1042). Kernel nftables drop verified."
            },
            {
                "id": "FW-9042",
                "target_ip": "45.154.255.89",
                "port_range": "22",
                "protocol": "TCP",
                "action": "DROP",
                "decision_source": "DETERMINISTIC_POLICY",
                "created_at": "2026-09-19T12:30:05Z",
                "expires_in_seconds": 3315,
                "is_active": True,
                "packets_dropped": 892,
                "verification_status": "VERIFIED",
                "rationale": "SSH Brute-force threshold exceeded (74 attempts / min). Bastion protection."
            },
            {
                "id": "FW-9043",
                "target_ip": "91.240.118.17",
                "port_range": "ALL",
                "protocol": "TCP/UDP",
                "action": "DROP",
                "decision_source": "DETERMINISTIC_POLICY",
                "created_at": "2026-09-19T10:12:05Z",
                "expires_in_seconds": 18200,
                "is_active": True,
                "packets_dropped": 3410,
                "verification_status": "VERIFIED",
                "rationale": "Phishing origin delivery server associated with INC-1040."
            },
            {
                "id": "FW-9038",
                "target_ip": "178.62.204.19",
                "port_range": "53",
                "protocol": "UDP",
                "action": "RATE_LIMIT",
                "decision_source": "SURICATA_AUTO",
                "created_at": "2026-09-19T09:14:22Z",
                "expires_in_seconds": 450,
                "is_active": True,
                "packets_dropped": 45190,
                "verification_status": "VERIFIED",
                "rationale": "DNS amplification flood mitigation: rate limited to 20 pkts/sec."
            },
            {
                "id": "FW-9035",
                "target_ip": "194.135.25.10",
                "port_range": "443",
                "protocol": "TCP",
                "action": "DROP",
                "decision_source": "MANUAL",
                "created_at": "2026-09-19T07:22:11Z",
                "expires_in_seconds": 12000,
                "is_active": True,
                "packets_dropped": 6120,
                "verification_status": "VERIFIED",
                "rationale": "Analyst manual containment: suspicious certificate probing."
            }
        ]

        # 6. Response Center Items
        self.responses: List[Dict[str, Any]] = [
            {
                "id": "RSP-771",
                "action_name": "NFTABLES_DROP_IP",
                "target": "185.220.101.42",
                "decision_source": "POLICY_ENGINE",
                "trigger_reason": "Port scan anomaly exceeding threshold (Risk Score: 94)",
                "executed_at": "2026-09-19T12:28:26Z",
                "execution_time_ms": 14,
                "status": "APPLIED_VERIFIED",
                "verified_by": "Kernel Netlink Socket (Table: cyberguard_inet, Chain: input)",
                "rollback_supported": True
            },
            {
                "id": "RSP-772",
                "action_name": "NFTABLES_DROP_IP",
                "target": "45.154.255.89",
                "decision_source": "POLICY_ENGINE",
                "trigger_reason": "SSH brute force attempts > 50/min (Risk Score: 88)",
                "executed_at": "2026-09-19T12:30:05Z",
                "execution_time_ms": 12,
                "status": "APPLIED_VERIFIED",
                "verified_by": "Kernel Netlink Socket",
                "rollback_supported": True
            },
            {
                "id": "RSP-773",
                "action_name": "REVOKE_USER_SESSION",
                "target": "deepak.mohanty@okcl.org",
                "decision_source": "IDENTITY_GUARD",
                "trigger_reason": "Impossible travel detection between Odisha and Frankfurt",
                "executed_at": "2026-09-19T11:46:15Z",
                "execution_time_ms": 42,
                "status": "APPLIED_VERIFIED",
                "verified_by": "Redis Token Blacklist Engine",
                "rollback_supported": False
            },
            {
                "id": "RSP-774",
                "action_name": "QUARANTINE_EMAIL_MESSAGE",
                "target": "msg-id-99410-okcl",
                "decision_source": "PHISH_CLASSIFIER",
                "trigger_reason": "Homoglyph domain spear phishing (Confidence 96%)",
                "executed_at": "2026-09-19T10:12:05Z",
                "execution_time_ms": 28,
                "status": "APPLIED_VERIFIED",
                "verified_by": "Milter Quarantine Vault",
                "rollback_supported": True
            },
            {
                "id": "RSP-775",
                "action_name": "RATE_LIMIT_UDP_53",
                "target": "178.62.204.19",
                "decision_source": "SURICATA_POLICY",
                "trigger_reason": "DNS Amplification volume threshold trip",
                "executed_at": "2026-09-19T09:14:22Z",
                "execution_time_ms": 9,
                "status": "APPLIED_VERIFIED",
                "verified_by": "Kernel nftables meter check",
                "rollback_supported": True
            }
        ]

        # 7. Phishing History
        self.phishing_history: List[Dict[str, Any]] = [
            {
                "id": "PH-501",
                "url_or_subject": "https://okcl-payroll.support-portal.top/login.php?auth_token=992",
                "classification": "MALICIOUS_PHISHING",
                "risk_score": 96,
                "confidence_pct": 98.4,
                "indicators": [
                    "Typo-squatting brand 'okcl'",
                    "High-risk TLD (.top)",
                    "Hidden credential exfiltration POST hook",
                    "Domain WHOIS: Registered 48h ago in Reykjavik"
                ],
                "domain_age_days": 2,
                "brand_impersonated": "OKCL Employee Payroll",
                "recommended_action": "QUARANTINE_AND_BLOCK_DOMAIN",
                "analyzed_at": "2026-09-19T10:12:04Z"
            },
            {
                "id": "PH-502",
                "url_or_subject": "https://microsoft-online-verify365.info/sso/adfs",
                "classification": "MALICIOUS_PHISHING",
                "risk_score": 91,
                "confidence_pct": 95.2,
                "indicators": [
                    "Microsoft login mimicry",
                    "Let's Encrypt short-duration certificate",
                    "Reverse proxy credential harvester"
                ],
                "domain_age_days": 5,
                "brand_impersonated": "Microsoft 365 Azure AD",
                "recommended_action": "QUARANTINE_AND_BLOCK_DOMAIN",
                "analyzed_at": "2026-09-19T09:40:11Z"
            },
            {
                "id": "PH-503",
                "url_or_subject": "https://portal.okcl.org/announcements/exam-schedule-2026",
                "classification": "CLEAN",
                "risk_score": 4,
                "confidence_pct": 99.8,
                "indicators": [
                    "Legitimate OKCL domain",
                    "Valid DigiCert EV SSL certificate",
                    "Domain age > 10 years",
                    "DNSSEC verified"
                ],
                "domain_age_days": 3840,
                "brand_impersonated": None,
                "recommended_action": "ALLOW",
                "analyzed_at": "2026-09-19T08:15:00Z"
            }
        ]

        # 8. Identity Anomalies & Users
        self.identity_users: List[Dict[str, Any]] = [
            {
                "id": "idu-1",
                "username": "deepak.mohanty",
                "email": "deepak.mohanty@okcl.org",
                "department": "Finance & Operations",
                "risk_score": 87,
                "mfa_enabled": True,
                "active_sessions": 0,
                "last_location": "Frankfurt, Germany (Anomalous)",
                "anomalies_detected": 3
            },
            {
                "id": "idu-2",
                "username": "ramesh.nayak",
                "email": "ramesh.nayak@okcl.org",
                "department": "IT Infrastructure",
                "risk_score": 85,
                "mfa_enabled": True,
                "active_sessions": 1,
                "last_location": "Bhubaneswar, India",
                "anomalies_detected": 2
            },
            {
                "id": "idu-3",
                "username": "priya.das",
                "email": "priya.das@okcl.org",
                "department": "eLearning Academy",
                "risk_score": 18,
                "mfa_enabled": True,
                "active_sessions": 2,
                "last_location": "Cuttack, India",
                "anomalies_detected": 0
            },
            {
                "id": "idu-4",
                "username": "subhashree.pattnaik",
                "email": "subhashree.p@okcl.org",
                "department": "eGovernance Projects",
                "risk_score": 12,
                "mfa_enabled": True,
                "active_sessions": 1,
                "last_location": "Bhubaneswar, India",
                "anomalies_detected": 0
            }
        ]

        self.identity_anomalies: List[Dict[str, Any]] = [
            {
                "id": "IDA-101",
                "user_email": "deepak.mohanty@okcl.org",
                "anomaly_type": "IMPOSSIBLE_TRAVEL",
                "risk_score": 89,
                "severity": "CRITICAL",
                "detected_at": "2026-09-19T11:45:00Z",
                "details": "Authenticated from Bhubaneswar (122.176.45.12) at 11:41, followed by Frankfurt (198.51.100.24) at 11:45.",
                "action_taken": "Tokens Revoked & Account Locked"
            },
            {
                "id": "IDA-102",
                "user_email": "ramesh.nayak@okcl.org",
                "anomaly_type": "PRIVILEGE_SPIKE",
                "risk_score": 85,
                "severity": "HIGH",
                "detected_at": "2026-09-19T12:35:15Z",
                "details": "Rapid enumeration of Active Directory Domain Admins group via workstation CLI.",
                "action_taken": "Under Investigation (INC-1042 Link)"
            },
            {
                "id": "IDA-103",
                "user_email": "anil.behera@okcl.org",
                "anomaly_type": "BRUTE_FORCE",
                "risk_score": 72,
                "severity": "MEDIUM",
                "detected_at": "2026-09-19T06:12:00Z",
                "details": "18 consecutive failed passwords on Webmail login portal from unfamiliar IP.",
                "action_taken": "IP Rate Limited & Password Reset Enforced"
            }
        ]

        # 9. Threat Intelligence Feeds & Indicators
        self.threat_indicators: List[Dict[str, Any]] = [
            {
                "indicator": "185.220.101.42",
                "type": "IP",
                "threat_actor": "Tor Relay / Scanning Cluster",
                "confidence": 98,
                "tlp": "AMBER",
                "first_seen": "2026-08-12",
                "last_seen": "2026-09-19",
                "tags": ["TOR_EXIT", "SCANNER", "BRUTE_FORCE"]
            },
            {
                "indicator": "45.154.255.89",
                "type": "IP",
                "threat_actor": "Storm-0501 Botnet",
                "confidence": 92,
                "tlp": "AMBER",
                "first_seen": "2026-09-01",
                "last_seen": "2026-09-19",
                "tags": ["SSH_SPRAY", "BOTNET", "BULLETPROOF_HOST"]
            },
            {
                "indicator": "okcl-payroll.support-portal.top",
                "type": "DOMAIN",
                "threat_actor": "Lazarus Subgroup / Phishing Fleet",
                "confidence": 99,
                "tlp": "RED",
                "first_seen": "2026-09-17",
                "last_seen": "2026-09-19",
                "tags": ["PHISHING", "CREDENTIAL_HARVEST", "HOMOGLYPH"]
            },
            {
                "indicator": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "type": "SHA256",
                "threat_actor": "Emotet Loader 2026 Variant",
                "confidence": 95,
                "tlp": "WHITE",
                "first_seen": "2026-07-20",
                "last_seen": "2026-09-18",
                "tags": ["MALWARE", "LOADER", "MACRO"]
            }
        ]

        # 10. Audit Logs
        self.audit_logs: List[Dict[str, Any]] = [
            {
                "id": "AUD-991",
                "timestamp": "2026-09-19T12:30:05Z",
                "actor": "PolicyEngine (Kernel Daemon)",
                "role": "system",
                "action": "NFTABLES_RULE_INSERT",
                "target": "45.154.255.89 (Port 22)",
                "decision_source": "DETERMINISTIC_POLICY",
                "request_id": "req-9981-fw",
                "status": "SUCCESS",
                "details": "Inserted rule DROP ip saddr 45.154.255.89 tcp dport 22. Verification code 0."
            },
            {
                "id": "AUD-990",
                "timestamp": "2026-09-19T12:28:26Z",
                "actor": "PolicyEngine (Kernel Daemon)",
                "role": "system",
                "action": "NFTABLES_RULE_INSERT",
                "target": "185.220.101.42 (ALL Ports)",
                "decision_source": "DETERMINISTIC_POLICY",
                "request_id": "req-9980-fw",
                "status": "SUCCESS",
                "details": "Inserted rule DROP ip saddr 185.220.101.42. TTL 3600s."
            },
            {
                "id": "AUD-989",
                "timestamp": "2026-09-19T11:46:15Z",
                "actor": "IdentityGuard Autonomous Worker",
                "role": "system",
                "action": "REVOKE_USER_SESSIONS",
                "target": "deepak.mohanty@okcl.org",
                "decision_source": "IDENTITY_ANOMALY_ENGINE",
                "request_id": "req-9975-id",
                "status": "SUCCESS",
                "details": "Blacklisted 2 active JWT refresh tokens in Redis. User notified."
            },
            {
                "id": "AUD-988",
                "timestamp": "2026-09-19T10:12:05Z",
                "actor": "PhishGuard Service",
                "role": "system",
                "action": "QUARANTINE_EMAIL_MESSAGE",
                "target": "msg-id-99410-okcl",
                "decision_source": "PHISH_CLASSIFIER",
                "request_id": "req-9964-ml",
                "status": "SUCCESS",
                "details": "Moved message to quarantine vault. Added sender to DNSBL."
            },
            {
                "id": "AUD-987",
                "timestamp": "2026-09-19T07:22:11Z",
                "actor": "elena.vance@cyberguard.internal",
                "role": "admin",
                "action": "MANUAL_FIREWALL_RULE_ADD",
                "target": "194.135.25.10 (Port 443)",
                "decision_source": "ANALYST_MANUAL",
                "request_id": "req-9912-ui",
                "status": "SUCCESS",
                "details": "Manual quarantine applied following suspicious certificate probing."
            }
        ]

        # 11. Multimodal & Deepfake Analysis Records
        self.multimodal_records: List[Dict[str, Any]] = [
            {
                "id": "MM-001",
                "source_type": "SMS",
                "content_text": "URGENT OKCL ALERT: Your student scholarship portal access (ID #99214) expires in 2 hours. Update KYC & bank details immediately to avoid de-registration: https://okcl-scholarship.portal-claim.online/kyc",
                "sender_metadata": "+91 98765-XXXXX (Spoofed Sender ID: OKCL-GOV)",
                "authenticity_score": 4.2,
                "risk_score": 96,
                "classification": "SMISHING_FRAUD",
                "impersonated_entity": "OKCL Scholarship Directorate",
                "indicators": [
                    "High psychological urgency ('expires in 2 hours')",
                    "Lookalike domain masquerade (.online TLD)",
                    "Unauthorized SMS route (Sender origin: Private GSM gateway, not DLT-registered Header)",
                    "Direct financial credential harvesting intent"
                ],
                "technical_artifacts": {
                    "gsm_route": "Unregistered International Route",
                    "shortener_target": "https://okcl-scholarship.portal-claim.online/kyc",
                    "sentiment_urgency_score": 0.98
                },
                "recommended_action": "PERIMETER_SMS_GATEWAY_BLOCK",
                "analyzed_at": "2026-09-19T12:45:00Z"
            },
            {
                "id": "MM-002",
                "source_type": "AUDIO_VOICE",
                "content_text": "Voice call recording: 'Hello IT Desk, this is Dr. Mohanty, Managing Director. I am stuck at the state secretariat meeting. Please bypass MFA for my account immediately and grant administrative VPN tokens.'",
                "media_url_or_name": "exec_voice_memo_urgent.wav",
                "sender_metadata": "SIP Inbound: +91-674-XXXXXX (Caller-ID Spoofed)",
                "authenticity_score": 8.5,
                "risk_score": 94,
                "classification": "DEEPFAKE_MANIPULATED",
                "impersonated_entity": "Senior Management / Managing Director",
                "indicators": [
                    "Synthetic neural vocoder acoustic artifacts detected (HiFi-GAN fingerprint)",
                    "Absence of natural micro-tremor and breathing pauses",
                    "Frequency cutoff at 8.2 kHz characteristic of voice conversion pipelines",
                    "Voice biometric match against real executive profile: 62% discrepancy"
                ],
                "technical_artifacts": {
                    "spectrogram_anomaly": "Unnatural phase continuity across formant transitions",
                    "vocoder_model_detected": "Bark / XTTS-v2 Voice Clone Profile",
                    "prosody_flatness_score": 0.91
                },
                "recommended_action": "ENFORCE_IN_PERSON_MFA_CHALLENGE",
                "analyzed_at": "2026-09-19T12:40:10Z"
            },
            {
                "id": "MM-003",
                "source_type": "VIDEO_DEEPFAKE",
                "content_text": "Webcam video briefing clip: Keynote address claiming an emergency cybersecurity patch requires all staff to install an urgent APK utility.",
                "media_url_or_name": "executive_urgent_briefing.mp4",
                "sender_metadata": "Uploaded via Web Portal Notification",
                "authenticity_score": 12.0,
                "risk_score": 92,
                "classification": "DEEPFAKE_MANIPULATED",
                "impersonated_entity": "Odisha IT Minister / Chief Information Officer",
                "indicators": [
                    "Facial boundary warping artifacts detected along jawline",
                    "Abnormal blink frequency: 1 blink in 90 seconds (Normal baseline: 15-20/min)",
                    "Phoneme-to-viseme lip sync latency of 180ms",
                    "Spatial lighting gradient mismatch between facial mask and background"
                ],
                "technical_artifacts": {
                    "facial_landmark_jitter": "High variance on outer cheek boundaries",
                    "optical_flow_inconsistency": "0.74 (Threshold 0.25)",
                    "synthetic_face_detector": "Dual-Stream Face Forensics Score: 0.96 Fake"
                },
                "recommended_action": "QUARANTINE_MEDIA_AND_ALERT_SOC",
                "analyzed_at": "2026-09-19T12:35:00Z"
            },
            {
                "id": "MM-004",
                "source_type": "IMAGE_QR",
                "content_text": "QR Code Notice: 'Official Examination Center Fee Payment - Scan with UPI app for instant verification.'",
                "media_url_or_name": "campus_notice_qr_payment.png",
                "sender_metadata": "Physical Notice Board Sensor Scan",
                "authenticity_score": 6.0,
                "risk_score": 95,
                "classification": "SMISHING_FRAUD",
                "impersonated_entity": "OKCL Academic Examination Cell",
                "indicators": [
                    "Embedded QR payload resolves to deceptive UPI VPA: okcl.student-fee@paytm (Unofficial personal handle)",
                    "Official OKCL payments only use ICICI corporate gateway",
                    "Embedded tracking redirect to phishing credential harvest endpoint"
                ],
                "technical_artifacts": {
                    "decoded_qr_string": "upi://pay?pa=okcl.student-fee@paytm&pn=OKCL_Official&am=1500",
                    "vpa_verification": "FAILED (Personal merchant account)",
                    "associated_domain": "okcl-payment-redirect.xyz"
                },
                "recommended_action": "QUARANTINE_MEDIA_AND_ALERT_SOC",
                "analyzed_at": "2026-09-19T12:20:00Z"
            },
            {
                "id": "MM-005",
                "source_type": "EMAIL",
                "content_text": "Subject: 'Mandatory Compliance: State e-Governance Audit Submission'\nFrom: director.compliance@odisha-gov-portal.org\nTo: finance@okcl.org\nBody: Please review the attached encrypted financial statement audit spreadsheet and verify employee Aadhaar numbers.",
                "media_url_or_name": "audit_compliance_sept2026.xlsm",
                "sender_metadata": "SMTP 103.212.45.19 (SPF: FAIL, DKIM: NONE)",
                "authenticity_score": 11.4,
                "risk_score": 91,
                "classification": "VIP_IMPERSONATION",
                "impersonated_entity": "State e-Governance Directorate",
                "indicators": [
                    "Sender domain odisha-gov-portal.org is lookalike (Official is odisha.gov.in)",
                    "SPF and DKIM cryptographic validation failed",
                    "VBA Macro payload detected in attached .xlsm spreadsheet",
                    "Executive authority impersonation to bypass normal verification"
                ],
                "technical_artifacts": {
                    "spf_result": "Fail (IP not authorized in SPF record)",
                    "dkim_result": "None",
                    "macro_detected": "Auto_Open() -> PowerShell DownloadString execution"
                },
                "recommended_action": "DROP_IP_AND_QUARANTINE_MAIL",
                "analyzed_at": "2026-09-19T12:10:00Z"
            }
        ]

        # 12. Simulator Scenarios
        self.simulator_scenarios = [
            {
                "id": "sim-port-scan",
                "name": "Scenario 1: Distributed TCP Port Sweep",
                "category": "Network Reconnaissance",
                "severity": "CRITICAL",
                "description": "Simulates an external reconnaissance sweep across 1,024 ports against OKCL Core Gateway. Generates high-volume SYN packets and triggers Suricata detection.",
                "targeted_subsystem": "Adaptive Firewall + Suricata IDS",
                "expected_outcome": "Risk score jumps to >90. Deterministic Policy synthesizes immediate nftables DROP rule. Response verified in kernel."
            },
            {
                "id": "sim-phishing",
                "name": "Scenario 2: Spear Phishing Masquerade",
                "category": "Social Engineering",
                "severity": "CRITICAL",
                "description": "Simulates an inbound email payload containing an evasive homoglyph URL masquerading as the OKCL Employee Portal.",
                "targeted_subsystem": "Phishing Analysis & ML Classifier",
                "expected_outcome": "Classifier identifies 96%+ malicious confidence. Email quarantined automatically, sender blocked at perimeter."
            },
            {
                "id": "sim-account-takeover",
                "name": "Scenario 3: Credential Stuffing & Impossible Travel",
                "category": "Identity Security",
                "severity": "HIGH",
                "description": "Simulates impossible travel login: authenticates user in Bhubaneswar, followed 4 minutes later by an authentication token from Frankfurt.",
                "targeted_subsystem": "Identity Security & Session Authority",
                "expected_outcome": "Identity Anomaly engine calculates velocity > 100,000 km/h. Active sessions instantly revoked, user forced to MFA reset."
            },
            {
                "id": "sim-ddos-flood",
                "name": "Scenario 4: SYN Flood & Amplification Attack",
                "category": "Denial of Service",
                "severity": "HIGH",
                "description": "Injects 50,000 packets/second synthetic flood to test kernel adaptive rate-limiting tables and latency stability.",
                "targeted_subsystem": "nftables Rate Limiting Meter",
                "expected_outcome": "Traffic throttled without dropping legitimate portal sessions. SOC latency remains under 5ms."
            },
            {
                "id": "sim-deepfake",
                "name": "Scenario 5: Audio Deepfake & Executive Voice Clone",
                "category": "Voice Deepfake / BEC",
                "severity": "CRITICAL",
                "description": "Simulates inbound audio call synthesizing Managing Director's voice via neural vocoder requesting urgent MFA security bypass and wire release.",
                "targeted_subsystem": "Multimodal Acoustic Spectral Engine",
                "expected_outcome": "Spectral roll-off >8kHz and flat F0 pitch prosody trigger 94% risk. Call quarantined, incident escalated with Netlink log."
            },
            {
                "id": "sim-quishing",
                "name": "Scenario 6: Omnichannel Quishing & Smishing Blitz",
                "category": "Multimodal Phishing",
                "severity": "HIGH",
                "description": "Simulates coordinated student fee QR quishing poster combined with spoofed DLT SMS notification redirecting to credential harvester.",
                "targeted_subsystem": "Vision OCR + QR Decoder + Adaptive Firewall",
                "expected_outcome": "Concealed URL decoded from QR matrix, typosquat domain blocked across firewall perimeter in <2 seconds."
            }
        ]

        # 13. Multimodal & Deepfake Records (Problem Statement 9)
        self.multimodal_records = [
            {
                "id": "MM-REC-901",
                "source_type": "SMS",
                "content_text": "URGENT OKCL ALERT: Your student scholarship grant of Rs. 25,000 has been approved. Update KYC & bank account immediately before 4:00 PM: https://okcl-grant.co/claim",
                "sender_metadata": "+91 98765-XXXXX (Spoofed DLT Header: OKCL-STUDENT)",
                "media_url_or_name": "none",
                "authenticity_score": 14,
                "risk_score": 96,
                "classification": "MALICIOUS_SMISHING",
                "verdict": "MALICIOUS",
                "severity": "CRITICAL",
                "threat_category": "URGENT_CREDENTIAL_HARVESTING",
                "impersonation_target": "OKCL Scholarship Directorate",
                "ai_explanation": "PLAIN-LANGUAGE SUMMARY: This fake scholarship SMS is designed to trick students into giving away their bank details. The attacker spoofed the sender name ('OKCL-STUDENT') and created a false sense of panic by claiming the Rs. 25,000 grant expires today. The link redirects to a fraudulent lookalike website registered only 2 days ago. CyberGuard blocked the scam website and quarantined the sender header so students are protected.",
                "indicators": ["Spoofed DLT Header", "Urgency/Threat Phrasing", "Unregistered Domain (Age 2 days)"],
                "technical_artifacts": {"dlt_status": "UNREGISTERED", "domain_age_days": 2, "entropy": 4.8},
                "recommended_action": "BLOCK_DOMAIN_FIREWALL_AND_REPORT_DLT",
                "analyzed_at": "2026-09-19T11:20:00Z"
            },
            {
                "id": "MM-REC-902",
                "source_type": "AUDIO_VOICE",
                "content_text": "Inbound Phone Call: 'Hello IT Desk, this is Dr. Mohanty, Managing Director. I am stuck at the state secretariat meeting. Please bypass MFA for my account immediately and grant administrative VPN tokens.'",
                "sender_metadata": "SIP Trunk: +91-674-239XXXX (Caller-ID Spoofed)",
                "media_url_or_name": "CEO_Emergency_Authorization_Call.wav",
                "authenticity_score": 18,
                "risk_score": 94,
                "classification": "SYNTHETIC_VOICE_DEEPFAKE",
                "verdict": "MALICIOUS",
                "severity": "CRITICAL",
                "threat_category": "EXECUTIVE_IMPERSONATION_FRAUD",
                "impersonation_target": "Dr. Mohanty (Managing Director)",
                "ai_explanation": "PLAIN-LANGUAGE SUMMARY: An attacker generated an AI clone of the Managing Director's voice to pressure the IT helpdesk into granting administrative access without standard MFA login. While the cloned voice sounds convincing to humans, our audio AI detected that the high frequencies abruptly stop above 8,150 Hz—a tell-tale signature of an artificial computer vocoder—and lacks normal human speech variation. CyberGuard immediately hung up the connection and locked the executive account from emergency password changes.",
                "indicators": ["HiFi-GAN 8kHz Spectral Cutoff", "Flat F0 Pitch Contour", "Zero Vocal Tract Microtremors"],
                "technical_artifacts": {"vocoder_model": "HiFi-GAN v2", "pitch_variance_hz": 4.2, "cosine_sim": 0.94},
                "recommended_action": "LOCK_ACCOUNT_AND_ALERT_EXECUTIVE_DESK",
                "analyzed_at": "2026-09-19T10:45:00Z"
            },
            {
                "id": "MM-REC-903",
                "source_type": "IMAGE_QR",
                "content_text": "Notice Board Poster: 'Official Examination Fee Payment Gateway - Scan with PhonePe/GooglePay to complete clearance.' Embedded URL: https://okcl-scholarship.portal-claim.online/verify?id=88319",
                "sender_metadata": "Sensor Cam #04 (Campus Notice Board)",
                "media_url_or_name": "campus_notice_qr_payment.png",
                "authenticity_score": 12,
                "risk_score": 92,
                "classification": "QUISHING_MALICIOUS_REDIRECT",
                "verdict": "MALICIOUS",
                "severity": "CRITICAL",
                "threat_category": "QUISHING_PAYMENT_REDIRECT",
                "impersonation_target": "OKCL Academic Examination Cell",
                "ai_explanation": "PLAIN-LANGUAGE SUMMARY: A counterfeit payment poster was stuck onto a campus notice board pretending to collect university examination fees. When students scan the QR code, it doesn't open the official university portal; it redirects to an unauthorized private payment link and a fake login site created 3 days ago. CyberGuard decoded the QR code, linked it to the scammer's server, and automatically blocked access at the firewall.",
                "indicators": ["Concealed QR Link", "Brand Logo Visual Tampering", "Domain Age 3 Days"],
                "technical_artifacts": {"decoded_url": "https://okcl-scholarship.portal-claim.online/verify", "ecc_level": "High"},
                "recommended_action": "DEPLOY_FIREWALL_NFTABLES_DROP_AND_REMOVE_PHYSICAL_POSTER",
                "analyzed_at": "2026-09-19T09:30:00Z"
            },
            {
                "id": "MM-REC-904",
                "source_type": "VIDEO_DEEPFAKE",
                "content_text": "Webcam Briefing Clip: Keynote speech announcing an emergency server migration and requesting staff to immediately log into a temporary credentials mirror.",
                "sender_metadata": "Internal Video Messaging Upload",
                "media_url_or_name": "Executive_Emergency_Press_Briefing.mp4",
                "authenticity_score": 16,
                "risk_score": 95,
                "classification": "MANIPULATED_VIDEO_DEEPFAKE",
                "verdict": "MALICIOUS",
                "severity": "CRITICAL",
                "threat_category": "VIDEO_FACIAL_REPLACEMENT",
                "impersonation_target": "Odisha IT Minister / CIO",
                "ai_explanation": "PLAIN-LANGUAGE SUMMARY: This video is an AI deepfake of a state minister ordering employees to log into a temporary server link. Our computer vision detectors found artificial blending seams along the jawline (88.4% distortion) and an abnormally low blink rate (only 1 blink per minute compared to normal human 15-20 blinks per minute). CyberGuard quarantined the video file and alerted leadership.",
                "indicators": ["Jawline Gaussian Seam Artifacts", "Abnormal Blink Cadence (1.2/min)", "Phoneme-to-Viseme Phase Drift"],
                "technical_artifacts": {"seam_inconsistency_pct": 88.4, "blink_rate": 1.2, "lip_sync_corr": 0.31},
                "recommended_action": "QUARANTINE_MEDIA_AND_ALERT_COMMUNICATIONS_OFFICE",
                "analyzed_at": "2026-09-19T08:15:00Z"
            }
        ]

        # 14. Settings
        import os
        self.settings = {
            "auto_mitigation_enabled": True,
            "risk_threshold_auto_block": 85,
            "rule_default_ttl_minutes": 60,
            "suricata_ids_mode": "INLINE_PREVENTION",
            "qwen_ai_analyst_enabled": True,
            "notification_webhook": "https://hooks.cyberguard.internal/alerts",
            "tenant_name": "CyberGuard SOC - Primary (Odisha)",
            "groq_api_key": os.environ.get("GROQ_API_KEY", ""),
            "groq_model": os.environ.get("GROQ_MODEL", "qwen/qwen3.8-27b"),
            "groq_enabled": bool(os.environ.get("GROQ_API_KEY", ""))
        }

db = InMemoryStore()
