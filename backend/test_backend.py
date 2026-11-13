import os
os.environ["CYBERGUARD_TEST_MODE"] = "1"
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/v1/health/live")
    assert response.status_code == 200
    assert response.json()["status"] == "ALIVE"

def test_login_success():
    payload = {
        "email": "elena.vance@cyberguard.internal",
        "password": "CyberGuard@2026!Admin"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"
    assert data["user"]["name"] == "Elena Vance"

def test_login_invalid_credentials():
    payload = {
        "email": "elena.vance@cyberguard.internal",
        "password": "WrongPassword123!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401

def test_dashboard_summary():
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["posture"]["overall_score"] == 92
    assert len(data["metrics"]) == 4

def test_incidents_and_investigation():
    response = client.get("/api/v1/incidents")
    assert response.status_code == 200
    incidents = response.json()
    assert len(incidents) >= 4
    
    # Check INC-1042
    inc1042 = client.get("/api/v1/incidents/inc-1042")
    assert inc1042.status_code == 200
    assert inc1042.json()["incident_number"] == "INC-1042"

def test_simulator_port_scan():
    # Login first
    login_res = client.post("/api/v1/auth/login", json={
        "email": "marcus.chen@cyberguard.internal",
        "password": "CyberGuard@2026!Analyst"
    })
    token = login_res.json()["access_token"]
    
    sim_res = client.post(
        "/api/v1/simulator/run",
        json={"scenario_id": "sim-port-scan"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert sim_res.status_code == 200
    data = sim_res.json()
    assert data["response_verification_status"] == "APPLIED_VERIFIED"
    assert data["adaptive_rule_created"] is not None

def test_ai_analyst():
    # 1. Tor port scan query
    response = client.post("/api/v1/ai/chat", json={"query": "Why was IP 185.220.101.42 blocked in INC-1042?"})
    assert response.status_code == 200
    data = response.json()
    assert len(data["grounded_evidence"]) > 0
    assert "disclaimer" in data
    assert any(x in str(data["grounded_evidence"]) for x in ["8,420", "Tor", "185.220.101.42", "ATK-", "INC-", "185.220"])

    # 2. Beginner / New to SOC query
    beginner_res = client.post("/api/v1/ai/chat", json={"query": "I am new to the SOC, can you explain CyberGuard properly in brief and short?"})
    assert beginner_res.status_code == 200
    b_data = beginner_res.json()
    assert "CyberGuard" in b_data["answer"] or "SOC" in b_data["answer"]

    # 3. Admin recent attacks query
    admin_res = client.post("/api/v1/ai/chat", json={"query": "What are the recent attacks and current active threats?"})
    assert admin_res.status_code == 200
    a_data = admin_res.json()
    assert len(a_data.get("answer", "")) > 20

    # 4. Voice deepfake query
    voice_res = client.post("/api/v1/ai/chat", json={"query": "Explain the voice deepfake audio call impersonating Dr. Deepak Mohanty"})
    assert voice_res.status_code == 200
    v_data = voice_res.json()
    assert any(word in v_data.get("answer", "").lower() for word in ["voice", "deepfake", "clone", "audio", "mohanty", "synthetic", "vocoder"])

    # 5. AI Status endpoint
    status_res = client.get("/api/v1/ai/status")
    assert status_res.status_code == 200
    s_data = status_res.json()
    assert "qwen_ai_analyst_enabled" in s_data
    assert "available_models" in s_data

def test_phishing_aged_domain_repurposing():
    # 1. Test 2.5-Year-Old Medical Clinic domain repurposed into OKCL Payroll scam
    clinic_url = "https://apexmedclinic.org/okcl-staff-payroll/login.php"
    res1 = client.post("/api/v1/phishing/analyze", json={"url_or_content": clinic_url})
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["classification"] == "CRITICAL_MALICIOUS (REPURPOSED AGED DOMAIN)"
    assert d1["risk_score"] >= 85
    assert d1["is_aged_repurposed_domain"] is True
    assert d1["domain_age_days"] == 912
    assert d1["days_since_update"] == 4
    assert d1["ssl_cert_age_days"] == 2
    assert any("VirusTotal" in ind for ind in d1["indicators"])
    assert "QWEN 2.5 ANALYST SUMMARY" in d1["ai_summary"]

    # 2. Test 3-Year-Old Bakery domain repurposed into State Scholarship scam
    bakery_url = "https://heritagebakery-shop.com/state-scholarship-disbursement/verify.php"
    res2 = client.post("/api/v1/phishing/analyze", json={"url_or_content": bakery_url})
    assert res2.status_code == 200
    d2 = res2.json()
    assert d2["classification"] == "CRITICAL_MALICIOUS (REPURPOSED AGED DOMAIN)"
    assert d2["risk_score"] >= 85
    assert d2["is_aged_repurposed_domain"] is True
    assert d2["domain_age_days"] == 1095

    # 3. Test genuine official domain remains CLEAN
    clean_url = "https://okcl.org"
    res3 = client.post("/api/v1/phishing/analyze", json={"url_or_content": clean_url})
    assert res3.status_code == 200
    d3 = res3.json()
    assert d3["classification"] == "CLEAN"
    assert d3["risk_score"] <= 10
    assert d3["recommended_action"] == "ALLOW"

def test_live_attack_and_chatbot_sync():
    from live_attack_hub import live_attack_hub
    from database import db

    # 1. Clear any prior test state so we verify clean start
    live_attack_hub.clear_history()
    db.threats.clear()

    # 2. Query chatbot with 0 attacks recorded
    res_empty = client.post("/api/v1/ai/chat", json={"query": "What are the recent attacks and current active threats?"})
    assert res_empty.status_code == 200
    ans_empty = res_empty.json()["answer"]
    assert any(term in ans_empty.lower() for term in ["no live attack", "no real-time", "0 active", "zero", "clean", "nominal", "standing by"])

    # 3. Fire real attack strike from simulated phone (IP 192.168.65.99)
    attack_payload = {
        "payload": "https://okcl-fake-verify.top/urgent-action.php",
        "attack_type": "WHATSAPP_PHISH",
        "impersonation_target": "OKCL State Student Gateway"
    }
    atk_res = client.post(
        "/api/v1/live-ingress",
        json=attack_payload,
        headers={"x-forwarded-for": "192.168.65.99"}
    )
    assert atk_res.status_code == 200
    atk_data = atk_res.json()
    assert atk_data["blocked"] is True
    assert atk_data["status"] == "INTERCEPTED_AND_BLOCKED"

    # 4. Verify telemetry state
    # A. Attack logged in live_attack_hub
    assert len(live_attack_hub.attack_history) >= 1
    assert live_attack_hub.attack_history[0]["client_ip"] == "192.168.65.99"
    # B. Threat logged in db.threats for review
    assert any(th["source_ip"] == "192.168.65.99" for th in db.threats)
    # C. Incident created in db.incidents
    assert any("192.168.65.99" in inc.get("source_ips", []) for inc in db.incidents)
    # D. Firewall rule installed
    assert any(r["target_ip"] == "192.168.65.99" and r["action"] == "DROP" for r in db.firewall_rules)

    # 5. Query chatbot: It must dynamically and accurately report the real attack!
    res_after = client.post("/api/v1/ai/chat", json={"query": "What are the recent attacks and current active threats?"})
    assert res_after.status_code == 200
    ans_after = res_after.json()["answer"]
    evidence_after = str(res_after.json().get("grounded_evidence", []))
    assert any(term in ans_after.lower() or term in evidence_after.lower() for term in ["whatsapp", "192.168.65.99", "phish", "atk-"])
    assert any(term in ans_after.lower() for term in ["ebpf", "drop", "blocked", "contained"])

    # 6. Verify zero packet leakage on subsequent request from same IP (403 Forbidden)
    leakage_res = client.post(
        "/api/v1/live-ingress",
        json=attack_payload,
        headers={"x-forwarded-for": "192.168.65.99"}
    )
    assert leakage_res.status_code == 403
    assert leakage_res.json()["status"] == "DROPPED_BY_KERNEL"

def test_threat_review_and_lifecycle():
    from database import db
    from live_attack_hub import live_attack_hub

    # 1. Verify dashboard initial state has 4-5 attacks
    live_attack_hub._init_default_attacks()
    db.reset_data()
    assert len(live_attack_hub.attack_history) >= 4
    assert any(a["attack_id"] == "ATK-9041" for a in live_attack_hub.attack_history)
    assert any("• Security Event & Reason:" in a["qwen_reasoning"] for a in live_attack_hub.attack_history)

    # 2. Verify Live Threats awaiting review exist
    assert len(db.threats) >= 4
    th_whatsapp = next(t for t in db.threats if t["id"] == "THR-9041")
    assert th_whatsapp["status"] == "AWAITING_REVIEW"
    assert th_whatsapp["review_status"] == "AWAITING_ANALYST_REVIEW"

    # 3. Test Threat Action: Allow
    allow_res = client.post(
        "/api/v1/threats/allow",
        json={"threat_id": "THR-9044", "source_ip": "192.168.1.105"},
        headers={"Authorization": "Bearer fake"}  # Test with analyst role or bypassed in testclient
    )
    # The endpoint requires admin or analyst role, let's login first or pass token
    login_res = client.post("/api/v1/auth/login", json={"email": "marcus.chen@cyberguard.internal", "password": "CyberGuard@2026!Analyst"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    allow_res2 = client.post(
        "/api/v1/threats/allow",
        json={"threat_id": "THR-9044", "source_ip": "192.168.1.105"},
        headers=headers
    )
    assert allow_res2.status_code == 200
    assert allow_res2.json()["status"] == "SUCCESS"
    assert next(t for t in db.threats if t["id"] == "THR-9044")["status"] == "ALLOWED"

    # 4. Test Threat Action: Block IP -> Problem Solved -> Goes to Recent Incidents!
    initial_inc_count = len(db.incidents)
    block_res = client.post(
        "/api/v1/threats/block",
        json={"threat_id": "THR-9041", "source_ip": "103.212.45.19"},
        headers=headers
    )
    assert block_res.status_code == 200
    assert block_res.json()["status"] == "SUCCESS"
    # Threat marked BLOCKED
    assert next(t for t in db.threats if t["id"] == "THR-9041")["status"] == "BLOCKED"
    # Firewall rule installed
    assert any(r["target_ip"] == "103.212.45.19" and r["action"] == "DROP" for r in db.firewall_rules)
    # Incident added to Recent Incidents!
    assert len(db.incidents) == initial_inc_count + 1
    new_inc = db.incidents[0]
    assert "103.212.45.19" in new_inc["source_ips"]
    assert new_inc["status"] == "CONTAINED"
    assert "• Security Event & Reason:" in new_inc["summary"]
    assert "• Detected Behavioral Anomaly:" in new_inc["summary"]
    assert "• Enforcement Action:" in new_inc["summary"]

if __name__ == "__main__":
    print("Running backend tests...")
    test_health()
    print("✓ test_health passed")
    test_login_success()
    print("✓ test_login_success passed")
    test_login_invalid_credentials()
    print("✓ test_login_invalid_credentials passed")
    test_dashboard_summary()
    print("✓ test_dashboard_summary passed")
    test_incidents_and_investigation()
    print("✓ test_incidents_and_investigation passed")
    test_simulator_port_scan()
    print("✓ test_simulator_port_scan passed")
    test_ai_analyst()
    print("✓ test_ai_analyst passed")
    test_phishing_aged_domain_repurposing()
    print("✓ test_phishing_aged_domain_repurposing passed")
    test_live_attack_and_chatbot_sync()
    print("✓ test_live_attack_and_chatbot_sync passed")
    test_threat_review_and_lifecycle()
    print("✓ test_threat_review_and_lifecycle passed")
    print(">>> ALL REAL TESTS PASSED INCLUDING THREAT LIFECYCLE! <<<")



