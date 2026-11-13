# CYBERGUARD — AI-Powered Cyber Threat, Phishing & Digital Impersonation Defense Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Design_System-Calm_Enterprise_Security-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Qwen 2.5](https://img.shields.io/badge/AI_Analyst-Qwen%202.5--3B%2F7B-FF6F00?logo=huggingface&logoColor=white)](https://huggingface.co/Qwen)
[![Security Architecture](https://img.shields.io/badge/Firewall-Linux_nftables_%2B_Netlink_Verification-blue)](#)
[![SOC Status](https://img.shields.io/badge/SOC_Posture-Nominal_92%25-10B981)](#)

> **Built for the Odisha Knowledge Corporation Limited (OKCL) Hackathon — Problem Statement 9:**  
> *"CYBERGUARD - AI Powered Cyber Threat, Phishing & Digital Impersonation Detection and Response System"*  
> **Domain:** Cybersecurity + Artificial Intelligence  
> **Team:** Cybernates

---

## Table of Contents
1. [Official Problem Statement & Context](#1-official-problem-statement--context)
2. [The Core Problem & Architectural Philosophy](#2-the-core-problem--architectural-philosophy)
3. [The CyberGuard Solution Overview](#3-the-cyberguard-solution-overview)
4. [Complete Technology Stack](#4-complete-technology-stack)
5. [Multi-Model AI Subsystem Architecture](#5-multi-model-ai-subsystem-architecture)
6. [Core System Modules & Screen Reference](#6-core-system-modules--screen-reference)
7. [Deterministic Policy Engine & Kernel Netlink Receipts](#7-deterministic-policy-engine--kernel-netlink-receipts)
8. [Heterogeneous Attack Graph & GNN Intelligence](#8-heterogeneous-attack-graph--gnn-intelligence)
9. [Complete API Reference](#9-complete-api-reference)
10. [Hackathon Judge Demonstration Scenarios](#10-hackathon-judge-demonstration-scenarios)
11. [Real-World Production Integration Guide](#11-real-world-production-integration-guide)
12. [Local Installation & Quickstart](#12-local-installation--quickstart)

---

## 1. Official Problem Statement & Context

### Background (From OKCL Problem Statement 9)
The rapid expansion of digital platforms, online education grids, cloud infrastructure, digital payments, and e-governance systems has exponentially widened the enterprise attack surface. Modern adversaries leverage **Generative AI and automated toolchains** to execute sophisticated, synchronized campaigns targeting both technical endpoints and human trust.

### The Challenge
Design and develop an **AI-powered Cyber Threat, Phishing and Digital Impersonation Detection & Response System** capable of identifying, analyzing, explaining, and neutralizing emerging threats in near real time.

The system must satisfy five key deliverables:
1. **Multi-Source Ingestion:** Ingest telemetry across network flows, authentication logs, emails, SMS/telecom headers, QR image matrices, audio recordings, and video frames.
2. **AI-Driven Detection & Classification:** Employ specialized models across NLP, computer vision, acoustic spectral processing, graph neural networks, and tabular anomaly detection.
3. **Deterministic & Explainable Scoring:** Provide mathematical risk scores ($0\text{--}100$) mapped to severity tiers (`Safe` $\to$ `Low` $\to$ `Medium` $\to$ `High` $\to$ `Critical`), coupled with transparent XAI evidence vectors.
4. **Autonomous Response & Verification:** Recommend and enforce verified mitigations (temporary kernel-level firewall drops, session revocation, IP containment) backed by immutable audit receipts.
5. **Unified SOC Command Dashboard:** Deliver an enterprise-grade situational awareness console engineered for high-density telemetric inspection and analyst triage.

---

## 2. The Core Problem & Architectural Philosophy

### The Dual-Plane Threat Blindspot
Modern state and educational infrastructures face attacks bifurcated across two distinct planes:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      THE DUAL-PLANE ATTACK THREAT                      │
└────────────────────────────────────────────────────────────────────────┘
          │                                              │
          ▼                                              ▼
  [ TECHNOLOGY LAYER ]                           [ HUMAN LAYER ]
  • SYN Flood & Port Sweeps                      • Telecom Smishing (DLT Spoofs)
  • SSH Password Spraying                        • Executive BEC Spear-Phishing
  • Geo-Velocity Impossible Travel               • Voice Clone Audio Deepfakes
  • API Abuse & Token Tampering                  • Malicious QR Code Quishing
  • Lateral Subnet Reconnaissance                • Synthetic Video Keynote Seams
```

**The Fatal Flaw of Traditional Firewalls:** Legacy firewalls inspect L3/L4 packet headers or static L7 signatures. They are completely blind to human-targeted multimodal deception (such as a voice-cloned CEO authorizing a fraudulent wire transfer or an SMS containing a look-alike scholarship URL).

### Our Foundational Principle: AI Advises, Deterministic Policy Enforces

```
                       ┌─────────────────────────┐
                       │   PROBABILISTIC AI      │
                       │ (Models, XAI, Vision,   │
                       │   Spectrograms, LLMs)   │
                       └────────────┬────────────┘
                                    │ Generates Scored Evidence
                                    ▼
                       ┌─────────────────────────┐
                       │  DETERMINISTIC POLICY   │
                       │ (Math Thresholds, TTL,  │
                       │   Kernel nftables API)  │
                       └────────────┬────────────┘
                                    │ Emits Verified Rules
                                    ▼
                       ┌─────────────────────────┐
                       │   LINUX KERNEL NETLINK  │
                       │ (AF_NETLINK, eBPF Drops)│
                       └─────────────────────────┘
```

> **Why we reject LLM-controlled firewall execution:**  
> Large Language Models are probabilistic, susceptible to prompt injection, and hallucinate under adversarial conditions. In CyberGuard, AI models analyze, calculate weights, extract features, and formulate explanations. However, **only a deterministic mathematical policy engine** evaluates risk thresholds, synthesizes ephemeral `nftables` rules with automatic TTL expiry, and verifies Linux kernel Netlink receipts.

---

## 3. The CyberGuard Solution Overview

CyberGuard is an end-to-end autonomous SOC platform featuring:
* **Real-Time Security Posture (92/100 Nominal):** Continuous fleet health monitoring, vector breakdowns, and proactive anomaly scoring.
* **Autonomous Adaptive Firewall:** Automatic rule synthesis targeting offending IPs with customizable TTL expiration (e.g. 60-minute quarantine) and kernel socket verification.
* **Multimodal Threat Lab:** Specialized sub-engines for QR Quishing decoding, spectral audio voice-clone verification, and facial boundary seam deepfake inspection.
* **Identity Security & Geo-Velocity Engine:** Detection of impossible travel ($\Delta \text{distance} / \Delta \text{time} > 800\text{ km/h}$) and concurrent multi-regional sessions.
* **Telecom Smishing & Phishing Analyzer:** DLT telecom registration validation, psychological urgency scoring, zero-width Unicode homoglyph detection, and look-alike domain flagging.
* **Heterogeneous Attack Graph (GNN):** Knowledge graph linking threat actors, spoofed telecom headers, SMS payloads, deceptive domains, resolved IPs, and targeted internal users.
* **Contextual AI Analyst Copilot:** Qwen 2.5-aligned conversational triage grounded strictly in telemetric facts with full MITRE ATT&CK mapping.
* **Interactive Attack Simulator Sandbox:** One-click simulation of 5 live attack scenarios with real-time blast-radius calculation and automated policy containment.

---

## 4. Complete Technology Stack

| Layer | Technology | Version | Purpose & Architecture |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React** | 19.2.8 | Reactive SPA UI with component-level state and instant transitions |
| **Frontend Language** | **TypeScript** | 6.0.2 | Strict type safety across all SOC telemetry models and API contracts |
| **Build & Dev Tool** | **Vite** | 8.3.0 | Sub-second HMR and production roll-up bundling |
| **Design System** | **TailwindCSS** | 3.4+ CDN | Calm Enterprise Security Intelligence design system tokens |
| **Typography** | **Google Fonts** | Inter & JetBrains | Crisp enterprise UI readability and fixed-pitch monospace telemetry |
| **Iconography** | **Lucide React** | 1.47.0 | Clean, modern vector icons for SOC workflows |
| **Backend Framework** | **FastAPI** | 0.115+ | High-throughput asynchronous Python ASGI web framework |
| **ASGI Server** | **Uvicorn** | 0.49.0 | Ultra-fast ASGI web server implementation |
| **Data Validation** | **Pydantic** | 2.13.5 | Strict schema validation and serialization for API requests/responses |
| **Cryptographic Hashing** | **Argon2-cffi** | 25.1.0 | Memory-hard, timing-attack resistant password hashing (PHC winner) |
| **Session Security** | **PyJWT** | 2.14.0 | Stateless cryptographically signed JWT access & refresh token rotation |
| **Real-time Protocol** | **WebSockets** | Native ASGI | Bi-directional streaming for live alerts, telemetry & log broadcasts |
| **Kernel Interop** | **Linux Netlink / nftables** | Table inet | Kernel-space packet filtering and ephemeral drop synthesis |
| **AI Copilot** | **Qwen 2.5 Instruct** | 3B/7B Baseline | Grounded contextual incident explanations and MITRE ATT&CK mappings |
| **NLP Subsystem** | **Fine-Tuned RoBERTa** | DeBERTa-v3 | Text classification, urgency scoring, homoglyph detection |
| **Audio Subsystem** | **Spectral CNN (RawNet2)** | PyTorch | Mel-spectrogram analysis, Nyquist vocoder roll-off, pitch tracking |
| **Vision Subsystem** | **ResNet50 / ViT** | PyTorch | 224x224 RGB crop analysis, DCT frequency domain, Grad-CAM heatmaps |
| **Graph Subsystem** | **PyG / NetworkX** | Heterogeneous | GNN entity embeddings, link prediction, infrastructure clustering |
| **Anomaly Subsystem** | **IsolationForest & KNN** | scikit-learn | Multi-dimensional tabular anomaly detection and travel velocity vectors |

---

## 5. Multi-Model AI Subsystem Architecture

CyberGuard rejects one-size-fits-all AI. It deploys an ensemble of 6 specialized models:

```
                  ┌──────────────────────────────────────────────┐
                  │          MULTI-SOURCE INGESTION              │
                  │  (SMS, Email, QR Images, Voice, Video, DPI)  │
                  └──────────────────────┬───────────────────────┘
                                         │
        ┌───────────────────┬────────────┴───────────┬───────────────────┐
        ▼                   ▼                        ▼                   ▼
 ┌──────────────┐   ┌──────────────┐         ┌──────────────┐    ┌───────────────┐
 │Tabular/Flows │   │  NLP / Text  │         │ Audio/Vision │    │ Graph Entity  │
 │(Network/Auth)│   │ (SMS / Email)│         │(Spectra/Seam)│    │(Topology/Link)│
 ├──────────────┤   ├──────────────┤         ├──────────────┤    ├───────────────┤
 │ KNN / XGBoost│   │ RoBERTa / De-│         │ CNN ResNet50 │    │ PyG / RGAT    │
 │IsolationForest   │ BERTa-Cyber  │         │ + RawNet2    │    │ Graph Network │
 ├──────────────┤   ├──────────────┤         ├──────────────┤    ├───────────────┤
 │ Explainability:  │Explainability:         │Explainability:    │Explainability:│
 │ TreeSHAP /   │   │ LIME / Token │         │ Grad-CAM Heat-│   │ Subgraph Path │
 │ Distance Pct │   │ Attribution  │         │ map Saliency │    │ / Louvain Com.│
 └──────┬───────┘   └──────┬───────┘         └──────┬───────┘    └───────┬───────┘
        │                  │                        │                    │
        └──────────────────┼────────────────────────┴────────────────────┘
                           ▼
        ┌───────────────────────────────────────────────────────────┐
        │   QWEN 2.5-3B/7B-INSTRUCT CONTEXTUAL REASONING COPILOT    │
        │      Fuses evidence vectors -> Plain-Language XAI         │
        └──────────────────────────┬────────────────────────────────┘
                                   ▼
        ┌───────────────────────────────────────────────────────────┐
        │       DETERMINISTIC POLICY ENGINE & NFTABLES DROP         │
        └───────────────────────────────────────────────────────────┘
```

### Specialized Model Specifications:

| Subsystem | Model Architecture | Inputs / Dimensions | Output & XAI Explainability |
| :--- | :--- | :--- | :--- |
| **Network Anomaly** | **KNN & Isolation Forest** | Flow inter-arrival, SYN/ACK ratio, packet burst variance | $\sigma$-distance from authentic baseline clusters; TreeSHAP feature weights |
| **Smishing / Email** | **Fine-Tuned RoBERTa** | Token sequences, Telecom DLT header metadata | LIME token attribution; highlights emotional urgency and deceptive call-to-actions |
| **Voice Deepfake** | **RawNet2 Spectral CNN** | 128-band Mel-Spectrograms, Constant-Q Transform | Identifies vocoder synthesis cutoff ($>8.1\text{ kHz}$) and robotic F0 flatlines |
| **Quishing & Video** | **ResNet50 + ViT** | 224x224 RGB image crops & DCT 2D frequency | Grad-CAM heatmap highlighting tampered facial boundary seams and payload URLs |
| **Identity Velocity** | **Geo-Distance Haversine** | $(\text{Lat}_1, \text{Lon}_1, t_1)$ to $(\text{Lat}_2, \text{Lon}_2, t_2)$ | Velocity vector in $\text{km/h}$; flags impossible travel ($>800\text{ km/h}$) |
| **Threat Topology** | **Heterogeneous RGAT GNN** | Multi-relational nodes (Actor, Domain, IP, SMS, User) | GNNExplainer computes minimal subgraph connecting adversary to victim |
| **SOC Copilot** | **Qwen 2.5 Instruct** | Grounded incident context, Suricata logs, XAI vectors | Synthesis of natural language reports + exact MITRE ATT&CK technique IDs |

---

## 6. Core System Modules & Screen Reference

All screens are designed under the **Calm Enterprise Security Intelligence** design system:

| Module | Source File | Core Capabilities |
| :--- | :--- | :--- |
| **Security Overview** | [`OverviewPage.tsx`](file:///a:/Cybernates/frontend/src/pages/OverviewPage.tsx) | Live 92/100 posture meter, active threat previews, vector breakdowns, telemetry sync |
| **Live Threats Stream** | [`LiveThreatsPage.tsx`](file:///a:/Cybernates/frontend/src/pages/LiveThreatsPage.tsx) | Real-time threat feed, severity filtering, quarantine triggers, vector categorization |
| **Incidents Center** | [`IncidentsPage.tsx`](file:///a:/Cybernates/frontend/src/pages/IncidentsPage.tsx) | Incident management, SLA trackers, severity filters, investigation deep links |
| **Incident Investigation** | [`InvestigationPage.tsx`](file:///a:/Cybernates/frontend/src/pages/InvestigationPage.tsx) | Multi-tab deep-dive (INC-1042): Evidence artifacts, timeline, mitigation actions, AI triage |
| **Adaptive Firewall** | [`AdaptiveFirewallPage.tsx`](file:///a:/Cybernates/frontend/src/pages/AdaptiveFirewallPage.tsx) | Active rules table, TTL countdowns, netlink socket receipts, manual rule creator |
| **Network Intelligence** | [`NetworkIntelligencePage.tsx`](file:///a:/Cybernates/frontend/src/pages/NetworkIntelligencePage.tsx) | Subnet traffic histograms, top talkers, flow telemetry, anomaly threshold gauges |
| **Identity Security** | [`IdentitySecurityPage.tsx`](file:///a:/Cybernates/frontend/src/pages/IdentitySecurityPage.tsx) | User risk roster, geo-velocity radar, impossible travel maps, session revocation |
| **Phishing Analysis** | [`PhishingAnalysisPage.tsx`](file:///a:/Cybernates/frontend/src/pages/PhishingAnalysisPage.tsx) | Live email/SMS sandbox, DLT header validator, token urgency heatmaps, homoglyphs |
| **Multimodal Threat Lab** | [`MultimodalThreatLabPage.tsx`](file:///a:/Cybernates/frontend/src/pages/MultimodalThreatLabPage.tsx) | QR Quishing inspector, audio spectrogram acoustic analyzer, video frame seam detector |
| **Attack Graph (GNN)** | [`GraphIntelligencePage.tsx`](file:///a:/Cybernates/frontend/src/pages/GraphIntelligencePage.tsx) | Interactive SVG/canvas graph explorer linking threat campaigns across multi-hop nodes |
| **AI Security Analyst** | [`AIAnalystPage.tsx`](file:///a:/Cybernates/frontend/src/pages/AIAnalystPage.tsx) | Qwen 2.5 interactive copilot with evidence citations, prompt presets, and MITRE mapping |
| **Threat Intelligence** | [`ThreatIntelligencePage.tsx`](file:///a:/Cybernates/frontend/src/pages/ThreatIntelligencePage.tsx) | Global IoC feed (Tor, APT29, Cobalt Strike), confidence scores, autonomous sync |
| **Response Center** | [`ResponseCenterPage.tsx`](file:///a:/Cybernates/frontend/src/pages/ResponseCenterPage.tsx) | Playbook execution logs, immutable audit trail, rollback support, netlink confirmations |
| **Simulator Sandbox** | [`SimulatorPage.tsx`](file:///a:/Cybernates/frontend/src/pages/SimulatorPage.tsx) | 5 live attack scenarios with blast-radius telemetry and instant policy validation |
| **System Health** | [`SystemHealthPage.tsx`](file:///a:/Cybernates/frontend/src/pages/SystemHealthPage.tsx) | Microservice probe health, memory consumption, latency gauges, engine heartbeat |
| **Settings & Policies** | [`SettingsPage.tsx`](file:///a:/Cybernates/frontend/src/pages/SettingsPage.tsx) | Risk thresholds, auto-mitigation toggles, default rule TTLs, notification channels |

---

## 7. Deterministic Policy Engine & Kernel Netlink Receipts

When a threat exceeds the autonomous blocking threshold (default: $\text{score} \ge 85$), [`DeterministicPolicyEngine`](file:///a:/Cybernates/backend/policy_engine.py) triggers the enforcement loop:

```
[Threat Detected: Score >= 85]
              │
              ▼
[1. Synthesize Rule: FW-9045] ──► Action: DROP, Protocol: TCP/UDP, TTL: 3600s
              │
              ▼
[2. Kernel Enforcement]       ──► Linux Netlink AF_NETLINK socket (nftables table inet)
              │
              ▼
[3. Generate Proof Receipt]   ──► Status: APPLIED_VERIFIED, Packets Dropped: Counter
              │
              ▼
[4. Immutable Audit Trail]    ──► Actor: PolicyEngine, Role: system, Timestamp: UTC
```

### Sample Netlink Verification Receipt:
```json
{
  "id": "RSP-776",
  "action_name": "NFTABLES_DROP_IP",
  "target": "185.220.101.42",
  "decision_source": "POLICY_ENGINE",
  "trigger_reason": "Autonomous enforcement for Network Port Scan / Brute-Force (Risk: 94)",
  "executed_at": "2026-09-26T14:27:00Z",
  "execution_time_ms": 11,
  "status": "APPLIED_VERIFIED",
  "verified_by": "Kernel Netlink Socket (Table: cyberguard_inet, Rule FW-9045)",
  "rollback_supported": true
}
```

---

## 8. Heterogeneous Attack Graph & GNN Intelligence

CyberGuard uncovers multi-hop attacker infrastructure using heterogeneous graph correlation:

```
[Threat Actor: Storm-0501]
       │
       ├──(ACQUIRED_SPOOF)──► [DLT Header: OKCL-GOV] ──(TRANSMITS)──► [SMS: Scholarship KYC Scam]
       │                                                                      │
       │                                                               (CONTAINS_LINK)
       │                                                                      ▼
[MITRE T1566: Phishing]                                       [Domain: okcl-scholarship.portal-claim.online]
                                                                              │
                                                                       (RESOLVES_DNS_A)
                                                                              ▼
[Victim: deepak.mohanty] ──(IMPOSSIBLE_TRAVEL_SESSION)───────► [IP: 103.212.45.19 (Frankfurt AS24940)]
                                                                              ▲
                                                                              │
                                                                   (ENFORCES_NFTABLES_DROP)
                                                                              │
                                                                 [Adaptive FW: FW-RULE-DROP-9041]
```

---

## 9. Complete API Reference

All endpoints are hosted under `/api/v1` and documented interactively via Swagger UI at `http://127.0.0.1:8000/docs`:

### Authentication & Sessions
* `POST /api/v1/auth/login` — Authenticate credentials (Argon2id verification) $\to$ returns JWT Access + Refresh token + RBAC Profile.
* `POST /api/v1/auth/refresh` — Rotate expired access tokens using a valid refresh token.
* `GET  /api/v1/auth/me` — Retrieve the authenticated analyst session context.

### SOC Telemetry & Dashboard
* `GET /api/v1/dashboard/summary` — Full SOC posture score, active threats preview, vector distributions, recent incident roll-up.
* `GET /api/v1/threats` — Live streaming threat telemetry feed.
* `GET /api/v1/threats/{id}` — Threat detail by ID.

### Incident Management & Investigation
* `GET  /api/v1/incidents` — List all incidents with severity, vector, and status filters.
* `GET  /api/v1/incidents/{id}` — Deep-dive investigation data (INC-1042) with artifacts, timeline, and XAI evidence.
* `POST /api/v1/incidents/{id}/quarantine` — Trigger manual IP quarantine for an active incident.

### Adaptive Firewall
* `GET  /api/v1/firewall/rules` — List active/expired kernel rules, TTL countdowns, and packet counters.
* `POST /api/v1/firewall/rules` — Synthesize a new rule (IP, CIDR, port, protocol, action, TTL).
* `DELETE /api/v1/firewall/rules/{id}` — Revoke an active firewall rule (with kernel Netlink teardown).

### AI Engines & Threat Lab
* `POST /api/v1/phishing/analyze` — Submit email, SMS, or URL text for RoBERTa NLP urgency, homoglyph, and DLT validation.
* `POST /api/v1/multimodal/analyze` — Submit media (QR image, audio voice clip, or video frames) for deepfake/quishing analysis.
* `POST /api/v1/ai/chat` — Grounded Qwen 2.5 Copilot query with optional incident context.

### Network, Identity & Intelligence
* `GET /api/v1/network/telemetry` — Subnet flows, top bandwidth consumers, protocol distribution.
* `GET /api/v1/identity/users` — User security roster, risk scores, impossible travel anomalies.
* `POST /api/v1/identity/users/{id}/revoke-session` — Revoke active tokens and force re-authentication.
* `GET /api/v1/threat-intel/indicators` — Global IoC feed with confidence scores and threat types.
* `GET /api/v1/graph/topology` — Heterogeneous attack graph nodes and edges.

### Response, Simulation & Health
* `GET  /api/v1/responses` — Automated response execution log and verification receipts.
* `POST /api/v1/simulator/run` — Execute simulated attack scenario (`sim-port-scan`, `sim-deepfake`, `sim-phish-blast`, etc.).
* `GET  /api/v1/system/health` — Probes for database, policy engine, AI models, and memory telemetry.
* `GET  /api/v1/settings` & `PUT /api/v1/settings` — Get and update SOC risk thresholds and automation configurations.
* `WS   /api/v1/ws` — Real-time bidirectional WebSocket stream for telemetry and live alerts.

---

## 10. Hackathon Judge Demonstration Scenarios

To demonstrate the three required threat categories (Technical, Human/Phishing, Deepfake/Impersonation):

### Scenario 1: Technical Network Attack (Port Scan & SSH Spraying)
* **Navigate to:** `Operations > Simulator`
* **Trigger:** Click **"Execute Attack Simulation"** on *SYN Flood & SSH Port Sweep (`sim-port-scan`)*.
* **Observe:** 
  1. Risk score jumps to **94/100 (Critical)**.
  2. Deterministic Policy Engine automatically synthesizes rule `FW-9045` blocking `185.220.101.42`.
  3. Netlink receipt confirms rule verified in Linux kernel table `cyberguard_inet`.
  4. View rule in **`Security > Adaptive Firewall`**.

### Scenario 2: Human-Layer Smishing & Spoofed DLT Telecom
* **Navigate to:** `Intelligence > Phishing Analysis`
* **Observe:** Load the pre-configured **OKCL Scholarship Urgent KYC Scam**.
* **Observe:** 
  1. Header `VK-OKCLGOV` flagged as unregistered in TRAI DLT whitelist.
  2. RoBERTa detects **98% urgency token probability**.
  3. URL `okcl-scholarship.portal-claim.online` flagged as look-alike domain targeting state infrastructure.

### Scenario 3: Multimodal Voice Cloning & Deepfake Video
* **Navigate to:** `Intelligence > Multimodal & Deepfake`
* **Observe:** 
  1. **Acoustic Spectrogram:** Voice sample analyzed for vocoder cutoff $>8.1\text{ kHz}$ with zero human jitter. Authenticity: **14% (Deepfake Detected)**.
  2. **Facial Seam Detector:** High-frequency boundary anomalies highlighted via Grad-CAM saliency heatmaps.
  3. **QR Quishing:** Malicious payment redirection decoded and quarantined.

---

## 11. Real-World Production Integration Guide

To deploy CyberGuard across state or enterprise datacenters:

```
[Live Enterprise Infrastructure]
       ├── Suricata / Zeek IDS       ──► POST /api/v1/incidents (Syslog / Eve JSON)
       ├── Microsoft 365 / Postfix   ──► POST /api/v1/phishing/analyze (Mail Flow Webhook)
       ├── Telecom DLT Gateway       ──► POST /api/v1/phishing/analyze (SMS Ingestion)
       ├── Okta / Active Directory   ──► POST /api/v1/identity/users (Auth Event Stream)
       └── Linux Host Network        ◄── NFTABLES KERNEL DROPS via Netlink Sockets
```

### Production Checklist:
1. **Linux Kernel Enforcement:** Deploy on Linux server with `nftables`. Policy engine invokes `nft add rule inet cyberguard input ip saddr <ip> drop`.
2. **Persistent Storage:** Replace in-memory dictionaries in [`database.py`](file:///a:/Cybernates/backend/database.py) with **PostgreSQL** (via SQLAlchemy) and **Redis Pub/Sub** for WebSockets.
3. **Reverse Proxy & SSL:** Front the FastAPI backend and React frontend with **Nginx** and **Let's Encrypt SSL/TLS**.

---

## 12. Local Installation & Quickstart

### 🚀 Instant 1-Click Launch (Recommended)
Simply double-click **`run.bat`** (or run `python run.py` in PowerShell/Terminal):
```cmd
run.bat
```
This automatically verifies dependencies, starts the FastAPI backend (port 8000), starts the Vite React frontend (port 5173), and pops open your default web browser!

For a full step-by-step judge presentation script and demonstration cheat sheet, see **[DEMO_WALKTHROUGH_GUIDE.md](file:///a:/Cybernates/DEMO_WALKTHROUGH_GUIDE.md)**.

### Manual Setup (Separate Terminals)

#### 1. Backend Setup
```bash
cd a:/Cybernates/backend
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation live at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

#### 2. Frontend Setup
```bash
cd a:/Cybernates/frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Open your browser at: [http://localhost:5173](http://localhost:5173)

### 3. Demo Credentials
* **Administrator Role (Full SOC Clearance):**
  * **Email:** `elena.vance@cyberguard.internal`
  * **Password:** `CyberGuard@2026!Admin`
  * *(Pre-filled on login screen)*
* **Analyst Role:** `marcus.chen@cyberguard.internal` / `CyberGuard@2026!Analyst`
* **Auditor Role:** `sarah.jenkins@cyberguard.internal` / `CyberGuard@2026!Viewer`

---

## License & Attribution
Developed by **Team Cybernates** for the **Odisha Knowledge Corporation Limited (OKCL) Hackathon**.  
Architecture and codebase licensed under the Apache 2.0 License.
