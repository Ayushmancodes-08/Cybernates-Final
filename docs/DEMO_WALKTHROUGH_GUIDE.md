# CYBERGUARD — Live Demonstration Runbook & Presentation Guide

> **Event:** Odisha Knowledge Corporation Limited (OKCL) Hackathon  
> **Problem Statement 9:** CYBERGUARD — AI-Powered Cyber Threat, Phishing & Digital Impersonation Detection and Response System  
> **Team:** Cybernates (Team ID: `BH26PS09T049`)  
> **Target Run Environment:** `http://localhost:5173` (Frontend) + `http://127.0.0.1:8000` (Backend)

---

## 🚀 Quick Start: How to Run the Entire Project (1 Click)

### Option A: The Universal Launcher (Recommended)
Double-click **`run.bat`** in the project root directory (or run `python run.py`).
* Automatically checks and installs all Python packages (`backend/requirements.txt`)
* Checks Frontend `node_modules` and builds dependencies
* Starts FastAPI Backend on `http://127.0.0.1:8000`
* Starts Vite React Frontend on `http://127.0.0.1:5173`
* Automatically pops open your default web browser to the dashboard!

### Option B: Separate Terminal Windows
* **Backend:** Double-click `start_backend.bat`
* **Frontend:** Double-click `start_frontend.bat`

### 🔑 Login Credentials
* **Admin (Lead Architect):** `elena.vance@cyberguard.internal` / `CyberGuard@2026!Admin` *(Pre-filled on login screen)*
* **Analyst (Senior SOC):** `marcus.chen@cyberguard.internal` / `CyberGuard@2026!Analyst`
* **Auditor (Security Viewer):** `sarah.jenkins@cyberguard.internal` / `CyberGuard@2026!Viewer`

---

## 🎯 3 Primary Demonstration Scenarios (For Evaluators & Judges)

You can launch any of these three live demonstrations instantly by clicking the **`⭐ Live Demo Showcase`** button located on the top navigation bar, or via the **Live Demonstration Suite** banner on the Overview page.

---

### Function 1: Autonomous Adaptive Firewall & Kernel Netlink Enforcement
* **Target Threat Plane:** Technical & IoT Network Plane (Slides 3, 5, 9 in `Cybernates_30.pptx`)
* **Vector:** Distributed TCP SYN Sweep (1,024 probe packets) targeting OKCL Core Gateway (`10.0.12.44:443`).
* **Underlying AI/ML Models:** Flow ML (Isolation Forest + K-Nearest Neighbors trained on `CIC-IDS2017`).
* **How to Demonstrate:**
  1. On the Overview page or in the `⭐ Live Demo Showcase` modal, click **`Simulate & Open Firewall`** on Card 1.
  2. Watch the live 5-stage pipeline execute:
     - **01. Ingestion:** 1,024 synthetic SYN packets injected.
     - **02. Sensor IDS:** Suricata signature `#2018489` trips.
     - **03. Risk Engine:** Continuous risk score jumps to **94/100** (exceeds the 85 deterministic threshold).
     - **04. Policy Engine:** Synthesizes ephemeral rule `DROP ip saddr 198.51.100.99` with **3600s TTL**.
     - **05. Kernel Receipt:** Linux Netlink socket returns `APPLIED_VERIFIED` proof receipt.
  3. Inspect the live table under **Adaptive Firewall**: notice the countdown timer (`TTL 3598s...`), zero packet leakage counter, and one-click rollback capability.
* **Speaker Script (What to tell the Judges — 40 seconds):**
  > *"Respected judges, when an attack strikes, manual response takes 45 minutes on average, while attackers breach systems in under 5. Here is our Adaptive Firewall in action: We simulate a 1,024-packet port sweep against the OKCL gateway. Notice our core architectural principle: **AI Advises, Deterministic Policy Enforces**. The ML ensemble computes a 94 risk score, but only our deterministic policy engine synthesizes the drop rule. It injects directly into kernel space via Netlink socket with a 1-hour TTL, preventing stale rule-bloat and eliminating the risk of LLM hallucinations."*

---

### Function 2: Multimodal Human-Trust Defense — Voice Deepfake & Mel-Spectrogram
* **Target Threat Plane:** Human Trust & Social Engineering Plane (Slides 4, 6, 8 in `Cybernates_30.pptx`)
* **Vector:** Acoustic Voice Cloning / Business Email Compromise (BEC) VoIP call spoofing OKCL Managing Director Dr. Deepak Mohanty requesting administrative MFA security bypass.
* **Underlying AI/ML Models:** RawNet2 Spectral CNN + Constant-Q Transforms trained on `ASVspoof 2021`.
* **How to Demonstrate:**
  1. Click **`Simulate & Open Threat Lab`** on Card 2 (or go to **Multimodal & Deepfake** in sidebar).
  2. Select the **Audio / Voice** tab.
  3. Observe the **128-Band Mel-Spectrogram Visualization**:
     - Highlights the telltale **Nyquist vocoder high-frequency roll-off (>8,150 Hz)** characteristic of neural vocoders like HiFi-GAN and Tacotron2.
     - Displays the robotic pitch contour flatline ($F_0\ \sigma = 4.2\text{ Hz}$ vs normal human speech $\sigma > 18\text{ Hz}$).
     - Shows the authenticity score: **14% Authentic (86% Deepfake Confidence)**.
  4. Note the automated response: SIP trunk origin quarantined, Managing Director credentials locked from emergency re-issuance.
* **Speaker Script (What to tell the Judges — 40 seconds):**
  > *"Attackers don't just hack ports; they hack humans using generative AI. An administrator receives a call with the cloned voice of OKCL's Managing Director. To a human ear, it sounds indistinguishable. But in CyberGuard's Multimodal Threat Lab, our RawNet2 spectral analyzer exposes what the human ear cannot perceive: synthetic neural vocoders cut off abruptly past 8.15 kilohertz, and pitch variance flatlines. CyberGuard flags the 86% deepfake probability and isolates the SIP trunk in real time."*

---

### Function 3: Correlation Plane — Scholarship Quishing & Attack Graph Campaign
* **Target Threat Plane:** Cross-Source Correlation & Graph Intelligence (Slides 4, 7, 8 in `Cybernates_30.pptx`)
* **Vector:** Omnichannel campaign targeting OKCL students: campus notice board QR poster + spoofed TRAI DLT header SMS (`OKCL-GOV`) redirecting to a zero-day credential harvesting domain.
* **Underlying AI/ML Models:** Fine-Tuned RoBERTa (NLP) + Computer Vision QR Decoder + PyG Heterogeneous Relational Graph Attention Network (`RGAT GNN`).
* **How to Demonstrate:**
  1. Click **`Simulate & View Attack Graph`** on Card 3 (or click **Attack Graph (GNN)** in sidebar).
  2. In the Interactive Attack Graph Explorer, inspect the correlated chain:
     - `Threat Actor: Storm-0501` ──► `DLT Header: OKCL-GOV (Spoofed)` ──► `SMS: Scholarship KYC Scam`
     - `SMS / Notice Poster QR` ──► `Domain: okcl-scholarship.portal-claim.online`
     - `Domain` ──► `Resolves DNS to IP: 103.212.45.19 (Frankfurt AS24940)`
     - `Victim: deepak.mohanty` ──(Impossible Travel Login from Frankfurt)──► `Compromised Session`
     - `Perimeter Action:` Adaptive Firewall rule `FW-RULE-DROP-9041` applied to `103.212.45.19`.
  3. Click any node in the graph (e.g., the Domain or Threat Actor) to view the graph embeddings and risk factors on the side inspector panel.
* **Speaker Script (What to tell the Judges — 40 seconds):**
  > *"Modern adversaries run coordinated, multi-hop campaigns. An SMS in Bhubaneswar, a QR poster on a campus wall, and an impossible travel login from Frankfurt look completely unrelated to traditional security tools. CyberGuard models the attack surface as a heterogeneous graph using PyG RGAT. It connects the unregistered DLT header, the malicious domain, and the Frankfurt server directly to Threat Actor Storm-0501. By blocking the root IP in the adaptive firewall, the entire statewide campaign collapses simultaneously."*

---

## 📊 Bonus: Slide 9 Architectural Comparison
Inside the **`⭐ Live Demo Showcase`** modal, click the tab **`Slide 9: AI vs Legacy Firewall`** to display the direct side-by-side comparison matrix:

| Evaluation Dimension | Traditional Rule-Based Security | CyberGuard Adaptive AI Firewall |
| :--- | :--- | :--- |
| **Detection Paradigm** | Predefined signatures & static L3/L4 rules | Multi-Model AI Ensemble (Text + Vision + Audio + Flow + GNN) |
| **Data Scope** | Isolated syslog feeds without correlation | Cross-plane correlation (SMS + Mel-Spectrogram + Netlink + Identity) |
| **Response Velocity** | Manual analyst triage (~45 minutes MTTR) | Sub-millisecond autonomous synthesis (~11 milliseconds) |
| **Rule Ephemerality** | Permanent static ACLs causing rule-bloat | Ephemeral rules with customizable TTL (3600s) |
| **Verification** | Assumed pushes with zero kernel verification | Linux Netlink socket returning immutable proof receipts |
| **Explainability (XAI)** | Black-box signature IDs | LIME token weights, Nyquist cutoffs & Qwen 2.5 MITRE triage |

---

## ❓ Judge Q&A Rapid-Fire Preparation

### Q1: "What prevents your autonomous firewall from locking out legitimate state users?"
* **Answer:** *"Three deterministic safeguards: First, autonomous drops only trigger at scores $\ge 85$ with multi-vector corroboration. Second, all rules are ephemeral with an automatic Time-to-Live counter (default: 60 minutes), preventing permanent blackholing. Third, our Response Center provides instant, one-click manual rollback with netlink socket teardown."*

### Q2: "Why can't you just use an LLM like ChatGPT or Claude for the whole thing?"
* **Answer:** *"LLMs are probabilistic, prone to hallucinations, and vulnerable to prompt injection attacks. Giving an LLM direct root permissions to write firewall rules is dangerous. CyberGuard enforces a strict architectural split: **AI Advises, Deterministic Policy Enforces**. The LLM (Qwen 2.5) only generates human-readable explanations and MITRE ATT&CK triage; only our mathematical policy engine can synthesize firewall commands."*

### Q3: "How does this scale to the entire state of Odisha?"
* **Answer:** *"CyberGuard is built on an asynchronous FastAPI microservices backbone with lightweight inference engines (RawNet2, RoBERTa, Isolation Forests) that run efficiently on standard edge servers or cloud clusters without requiring multiple high-end 80GB GPUs. It ingests standard formats (Suricata eve.json, TRAI DLT webhooks, Zeek logs) natively."*
