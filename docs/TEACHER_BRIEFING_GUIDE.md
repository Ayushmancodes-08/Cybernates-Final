# CYBERGUARD: PROJECT BRIEFING, ARCHITECTURE & DEFENSE MASTER GUIDE
**Project:** CYBERGUARD — AI-Powered Cyber Threat, Phishing & Digital Impersonation Defense Platform  
**Target:** Faculty Evaluation / Teacher Briefing / Project Defense & Viva  
**Team:** Cybernates  
**Problem Statement Reference:** OKCL Problem Statement 9 (Cybersecurity + Artificial Intelligence)  

---

## 1. Executive Summary & Problem Statement (PS9)

### 1.1 The Official Context
Modern academic grids, digital platforms, cloud services, e-governance portals, and financial ecosystems face hyper-accelerated attack vectors. Attackers no longer rely solely on brute force; they weaponize **Generative AI** to orchestrate synchronous attacks across two distinct planes:
1. **The Technical Plane:** High-rate volumetric DDoS, slow-rate application denial (Slowloris/Hulk), network port scanning, brute-force SSH spraying, API token abuse, and credential stuffing.
2. **The Human Trust Plane:** Hyper-realistic AI voice cloning, video deepfakes, spear-phishing emails, SMS smishing (bypassing telecom DLT registrations), and QR-code quishing.

### 1.2 The Core Problem with Existing Systems
Traditional defense solutions (such as conventional stateful firewalls, signature-based IDS, and spam filters) operate in strict siloes:
* **L3/L4/L7 Firewalls** inspect packet headers and fixed protocol rules. They are blind to deceptive text urgency, voice synthesis, or fake scholarship credentials.
* **Legacy Antivirus & Spam Filters** depend on static blacklists and regex signatures. An attacker who modifies an email with zero-width Unicode homoglyphs or generates a new synthetic deepfake will bypass these filters completely.

### 1.3 The CyberGuard Unique Solution
**CyberGuard** unites technical telemetry and multimodal human-layer deception into a unified, autonomous Defense Operations Platform.
* **Dual-Plane Protection:** Protects network flows, authentication logs, telecom headers, voice audio streams, video frames, and QR codes in a single platform.
* **Ensemble Intelligence:** Uses specialized machine learning models (XGBoost, KNN Similarity Engine, Benign Reconstruction Autoencoder, Spectral CNNs, Vision Transformers, and Local AI Reasoning) rather than a single black-box model.
* **Deterministic Policy Enforcement:** Ensures that while AI *scores and advises*, enforcement is handled by a mathematical deterministic engine (`nftables` / Linux Netlink receipts) to prevent AI hallucination and false-positive network lockouts.

---

## 2. Adaptive Firewall vs. Traditional Firewall

| Feature Dimension | Traditional Firewall (Stateful / Next-Gen) | CyberGuard Adaptive Firewall |
| :--- | :--- | :--- |
| **Inspection Scope** | L3/L4 packet headers (IP, Port, TCP flags) & static L7 DPI signatures. | Multi-dimensional: Network flow dynamics, payload entropy, voice/video authenticity, user behavioral velocity. |
| **Rule Generation** | Static, manual administrator configuration, or slow rule subscription updates. | **Autonomous & dynamic synthesis** based on multi-source ML risk scores ($0\text{--}100$). |
| **Mitigation Duration** | Permanent or indefinitely static until manual operator audit. | **Ephemeral with TTL (Time-To-Live)** countdown (e.g., 30m, 60m quarantine) with automated expiry. |
| **Handling of Novel Threats** | Zero-day attacks bypass static signatures entirely. | **Autoencoder Reconstruction Error** catches unmodeled deviations from benign baseline traffic. |
| **Verification & Audit** | Basic syslog notifications. | **Kernel-level Netlink Receipts** (`AF_NETLINK` socket verification) proving the packet drop occurred in kernel space. |
| **Human Layer Awareness** | Completely blind to audio, video, smishing, and QR scams. | Ingests threat feeds from human communication layers and immediately isolates the attacker's hosting IP / proxy. |

---

## 3. Machine Learning Models Trained & Their Specific Roles

Instead of relying on one generic model, CyberGuard employs a multi-tiered ensemble tailored to specific data distributions:

### 3.1 XGBoost Primary Classifier (UNSW-NB15 & CIC-DDoS Datasets)
* **Architecture:** Extreme Gradient Boosting (`XGBClassifier`) with regularized decision trees.
* **Why Chosen:** Tabular network flows (packet inter-arrival times, SYN/ACK ratios, packet length variance, flow duration) exhibit non-linear boundaries. XGBoost outperforms deep networks on tabular flow metrics in both inference speed (<2ms) and F1-score.
* **Dataset Used:** **UNSW-NB15** and **CIC-DDoS2019/2017** parquet datasets (150,000+ real-world attack flows including DoS Hulk, GoldenEye, Slowloris, Port Scans, and Benign traffic).
* **Role:** Classifies incoming network flows into nominal traffic vs. specific attack families and computes an attack probability ($0.0 \to 1.0$).

### 3.2 KNN Similarity Intelligence Engine (`NearestNeighbors` + `StandardScaler`)
* **Architecture:** $k$-Nearest Neighbors ($k=5$) embedded with historical attack archetypes.
* **Why Chosen:** Deep learning models are often accused of being "black boxes." KNN provides **case-based reasoning** and transparency.
* **Role:** When a suspicious flow is detected, KNN searches the indexed multidimensional feature space and returns the top 5 most similar historical attacks (e.g., *"Matches DoS Hulk signature with 94% similarity; duration: 0.04s, source bytes: 1420"*), providing immediate historical precedent to the SOC analyst.

### 3.3 Deep Reconstruction Autoencoder (PyTorch / Scikit-Learn MLP)
* **Architecture:** Multi-layer bottleneck Autoencoder ($D \to 32 \to 16 \to 8 \to 16 \to 32 \to D$) with ReLU activations.
* **Why Chosen:** Supervised models can only detect attacks they have seen during training. Zero-day attacks and stealthy state-sponsored exfiltration evade known signatures.
* **Training Strategy:** Trained **exclusively on clean, benign network traffic**.
* **Role:** Novel or zero-day network patterns cannot be reconstructed accurately by the compressed latent bottleneck. When the **Reconstruction Mean Squared Error (MSE)** exceeds the learned threshold ($\tau = 0.0215$), it triggers a **Zero-Day Anomaly Alert** even if no signature exists.

### 3.4 Multimodal Detection Models (Voice, QR & Video)
* **Spectral Audio Voice Clone Detector (RawNet2 / Mel-Spectrogram CNN):** Converts incoming audio streams into 128-band Mel-spectrograms. Generative vocoders (like HiFi-GAN or ElevenLabs) introduce subtle high-frequency acoustic cutoffs ($>8.1\text{ kHz}$) and flat pitch dynamics ($F_0$), which are flagged immediately.
* **Computer Vision Facial Seam Detector (ResNet50 / ViT):** Analyzes 224x224 RGB image crops and frequency domains (DCT 2D) to identify spatial lighting discrepancies, abnormal blink rates ($0.15\text{ blinks/sec}$), and edge-warping artifacts around facial perimeters.
* **QR Quishing Matrix Decoder:** Parses embedded high-entropy URLs, verifies against national DLT registers and UPI handles (e.g., detecting unauthorized third-party UPI addresses attempting fee diversion).

### 3.5 Grounded AI Security Analyst (Qwen 2.5 Instruct)
* **Role:** Acts as an interactive SOC Copilot. Instead of hallucinating, it operates strictly on grounded incident telemetry, mapping raw packet flags, WHOIS registration data, and Suricata IDS alerts directly to standard **MITRE ATT&CK techniques** (e.g., `T1110.001 Password Spraying`, `T1046 Network Service Discovery`).

---

## 4. End-to-End Technical Workflow: Sessions & Verification

### 4.1 How a User Session is Created & Secured
```
[Client / Browser]
       │
       ▼  1. POST /api/v1/auth/login (Email + Password)
[FastAPI Backend]
       │
       ├─► 2. Argon2id Password Verification (Memory-hard hash comparison)
       ├─► 3. RBAC Authorization Check (Admin, Analyst, Incident Responder)
       ├─► 4. Generate Cryptographic JWT Pair:
       │      • Access Token (HS256, 15-60 min validity)
       │      • Refresh Token (Secure Rotation, 7-day validity)
       ├─► 5. Write to Immutable Audit Ledger (`AUTH_LOGIN_SUCCESS`)
       │
       ▼  6. Return Tokens & User Profile
[React 19 Frontend]
       │
       ├─► 7. Store in AuthContext & LocalStorage (`cyberguard_access_token`)
       ├─► 8. Attach `Authorization: Bearer <token>` + `X-Tenant-ID` on all Axios requests
       └─► 9. Establish persistent WebSocket (`/ws/soc`) for live telemetry
```

### 4.2 How an Incoming Link / URL / SMS is Checked
```
[Incoming Payload] (e.g., SMS with URL: https://okcl-scholarship.portal-claim.online/kyc)
       │
       ▼  POST /api/v1/phishing/analyze or /api/v1/multimodal/analyze
[Feature Extraction & Linguistic Analysis]
       ├─► 1. Lexical URL Parser: Checks domain age (1 day old), anomalous TLD (.online, .top, .xyz)
       ├─► 2. NLP Deceptive Urgency Scoring: Identifies panic words ("urgent", "blocked", "kyc expiry")
       ├─► 3. Zero-Width Unicode & Homoglyph Engine: Catches Cyrillic/Greek character replacements
       ├─► 4. Telecom DLT Register Verification: Checks SMS sender ID against TRAI/telecom white-lists
       │
       ▼  [Threat Evaluated: Risk Score = 94/100 -> CRITICAL]
[Deterministic Policy Engine]
       ├─► 5. Evaluates threshold (Score >= 85)
       ├─► 6. Generates Ephemeral Firewall Rule: FW-9045 (DROP IP 185.220.101.42, TTL: 60m)
       ├─► 7. Communicates via Netlink (`AF_NETLINK`) with Linux kernel `nftables` table
       ├─► 8. Issues immutable verification receipt (`APPLIED_VERIFIED`, 11ms latency)
       └─► 9. Broadcasts WebSocket event to SOC Dashboard UI in real time
```

---

## 5. UI/UX & Frontend Architecture Pitch

When briefing your teacher, highlight that CyberGuard avoids generic dashboard templates in favor of a specialized **Calm Enterprise Security Intelligence** architecture:

1. **Information Density with Low Cognitive Load:**
   * Uses high-contrast dark themes (`#0B0F19` deep obsidian with teal/emerald status indicators).
   * Analysts can process live alerts, posture scores, and incident timelines without visual fatigue.
2. **Key Interactive Screens to Showcase:**
   * **Security Overview Dashboard:** Features the live 92/100 Posture Meter, real-time threat counts, and vector distribution pie charts.
   * **Adaptive Firewall Management:** Displays live active drop rules, countdown timers showing remaining TTL quarantine, and kernel verification chips.
   * **Multimodal Threat Lab:** Interactive tabs for QR Code Quishing, Audio Spectrogram Voice Clones, and Video Deepfake frame seams.
   * **Heterogeneous Attack Graph (GNN Explorer):** Visualizes the multi-hop relationship between an external threat actor, spoofed SMS headers, deceptive domains, resolved IP addresses, and the targeted internal employee.
   * **Incident Investigation Workspace (INC-1042):** Displays forensic evidence tabs, timeline chronologies, automated rollback toggles, and MITRE ATT&CK kill-chain mapping.
   * **Live Attack Simulator Sandbox:** Allows the evaluator to trigger a simulated attack scenario (e.g., Port Scan, Executive Deepfake, Credential Spray) with a single click to watch the firewall synthesize rules in real time.

---

## 6. Testing Methodology: Frontend & Backend

### 6.1 Backend Automated Testing (`pytest` & `TestClient`)
The backend contains automated tests verifying authentication security, policy execution, and inference integrity:
* **Health Endpoint Test:** Ensures liveness probe returns HTTP 200 and subsystem statuses.
* **Argon2id Authentication Suite:** Validates successful token issuance for valid credentials and explicit HTTP 401 rejections for invalid keys.
* **Deterministic Policy & Simulator Test:** Runs `/api/v1/simulator/run` and validates that an adaptive rule is synthesized and verified (`APPLIED_VERIFIED`) with proper Netlink audit logging.
* **AI Copilot Grounding Test:** Verifies that queries to `/api/v1/ai/chat` contain strictly telemetric evidence and mandatory non-hallucination disclaimers.

```bash
# How to run backend tests:
cd backend
pytest -v test_backend.py
```

### 6.2 Frontend Testing & Validation
* **TypeScript Strict Compiler Verification:** All data models (threats, telemetry, incidents, firewall rules) are strictly typed with zero implicit `any`.
* **Vite Hot Module Replacement (HMR) & Build Verification:** Ensures production bundles compile cleanly with tree-shaking and zero asset path errors.
* **Component-Level Role Validation:** UI components check user roles (`admin`, `analyst`, `responder`) and conditionally disable destructive actions (like manual rule deletion or session revocation) for unauthorized roles.

---

## 7. Future Scope: Advanced Image & Video Processing

When your teacher asks: *"Where can this project go in the future?"*, present the following concrete engineering roadmap:

### 7.1 Temporal Multi-Frame Video Forensics (3D-CNN & MesoNet++)
* **Current Implementation:** Analyzes spatial anomalies on individual 224x224 RGB image crops and discrete video keyframes.
* **Future Extension:** Implement **Spatiotemporal 3D Convolutional Networks (3D-CNNs) and Video Vision Transformers (TimeSformer)** to analyze motion consistency across 60+ consecutive frames.
* **Detection Goal:** Flag subtle temporal jitter in facial muscle contractions, irregular pulse variations extracted via **Remote Photoplethysmography (rPPG)** (measuring micro-color fluctuations in skin capillaries that deepfake generators fail to simulate).

### 7.2 Frequency Domain Bi-Orthogonal Wavelet & Fourier Inspection
* **Future Extension:** Integrate Discrete Wavelet Transform (DWT) and 2D Fourier Spectrum analysis.
* **Detection Goal:** Generative adversarial models (GANs) and Diffusion models leave identifiable upsampling checkerboard patterns in the high-frequency Fourier spectrum, allowing detection even when visual compression degrades pixel-level quality.

### 7.3 Real-Time WebRTC Video Stream Interception
* **Future Extension:** Build a browser extension / virtual webcam middleware utilizing WebAssembly (WASM) and ONNX Runtime.
* **Detection Goal:** Perform inline deepfake detection during live Zoom/Google Meet video calls, displaying a real-time "Authenticity Confidence Gauge" directly over the speaker's feed before sensitive institutional decisions or credential transfers are executed.

### 7.4 Explainable Vision Heatmaps (Grad-CAM & Attention Rollout)
* **Future Extension:** Directly overlay heatmaps on the UI showing the exact pixels that caused the model to classify an image or video as forged (e.g., highlighting earlobe blending seams, synthetic iris reflections, or unnatural background perspective grids).

---

## 8. Complete Project Technology Stack Summary

| Domain | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Frontend Core** | React 19, TypeScript, Vite | Fast, type-safe, reactive single-page user interface |
| **Styling & Icons** | TailwindCSS, Lucide React | Calm Enterprise Security design tokens & vector icons |
| **Backend Core** | FastAPI (ASGI), Uvicorn, Python 3.11+ | High-throughput async REST API with auto OpenAPI docs |
| **Security & Auth** | Argon2id, PyJWT, RBAC Middleware | Cryptographic password hashing & stateless JWT rotation |
| **Real-time Comms** | WebSockets (Native ASGI) | Real-time threat feed and telemetry streaming |
| **Firewall & Kernel** | Linux `nftables`, Python Netlink socket | Deterministic packet dropping with verification receipts |
| **Machine Learning** | XGBoost, Scikit-Learn, PyTorch | Flow classification, KNN similarity, Benign Autoencoder |
| **AI Analyst** | Qwen 2.5 Instruct (3B / 7B) | Grounded incident reasoning & MITRE ATT&CK attribution |
| **Datasets** | UNSW-NB15, CIC-DDoS 2019/2017 | Real-world benchmark training and validation |

---

## 9. Quick Q&A Cheat-Sheet for Your Teacher Briefing

**Q1: Why did you use both XGBoost and an Autoencoder?**  
*Answer:* "XGBoost is a supervised model trained on known attack patterns from the UNSW-NB15 dataset to provide high accuracy on known threats. The Autoencoder is an unsupervised anomaly detector trained strictly on benign traffic; it catches zero-day or novel attacks that have never been seen before based on high reconstruction error."

**Q2: What prevents the AI from accidentally blocking legitimate users?**  
*Answer:* "Our core design philosophy: *AI advises, but deterministic policy enforces*. The AI outputs a risk score and confidence vector. Our deterministic policy engine applies strict mathematical thresholds, assigns ephemeral rules with automatic TTL expiry (so no IP is permanently blacklisted without human review), and requires kernel Netlink receipt verification."

**Q3: How does CyberGuard detect deepfake audio?**  
*Answer:* "We convert the audio signal into a 128-band Mel-spectrogram. Neural vocoders used by AI cloning tools (such as HiFi-GAN) exhibit unnatural frequency cutoffs above 8kHz and lack natural human vocal micro-tremors. Our spectral classifier flags these acoustic artifacts with over 90% confidence."

**Q4: How do you verify that the firewall actually did its job?**  
*Answer:* "Instead of just assuming a rule was set, our backend queries the Linux Netlink socket (`AF_NETLINK`) to confirm the rule exists in the `nftables` table and issues a cryptographically signed execution receipt containing the execution timestamp, rule ID, and drop verification status."
