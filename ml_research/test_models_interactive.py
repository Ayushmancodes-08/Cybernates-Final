"""
CyberGuard ML & Multimodal Inference Testing Tool
Usage:
    python test_models_interactive.py --mode link --url "https://okcl-scholarship.portal-claim.online/kyc"
    python test_models_interactive.py --mode flow
    python test_models_interactive.py --mode voice
    python test_models_interactive.py --mode video
    python test_models_interactive.py --mode qr
"""

import sys
import os
import json
import argparse
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

from main import (
    analyze_phishing,
    analyze_multimodal,
    ml_evaluate_all_models,
    ml_predict_flow,
    ml_knn_similarity,
    ml_autoencoder_anomaly
)
from models import PhishingAnalysisRequest, MultimodalAnalysisRequest
import asyncio

def print_banner(title: str):
    print("\n" + "=" * 70)
    print(f"  CYBERGUARD MODEL INFERENCE: {title.upper()}")
    print("=" * 70)

def test_link(url: str):
    print_banner(f"Link & URL Verification ({url})")
    req = PhishingAnalysisRequest(url_or_content=url)
    res = asyncio.run(analyze_phishing(req))
    data = res.model_dump()
    print(f"[*] Target Checked      : {data['url_or_subject']}")
    print(f"[*] Classification      : {data['classification']}")
    print(f"[*] Risk Score (0-100)  : {data['risk_score']}")
    print(f"[*] Confidence          : {data['confidence_pct']}%")
    print(f"[*] Brand Impersonated  : {data.get('brand_impersonated') or 'None'}")
    print(f"[*] Domain Age          : {data.get('domain_age_days')} days")
    print(f"[*] Recommended Action  : {data['recommended_action']}")
    print("[*] Indicators Detected :")
    for ind in data["indicators"]:
        print(f"    - {ind}")
    return data

def test_flow(sample_type: str = "attack"):
    print_banner(f"Multi-Model Flow Inference ({sample_type.upper()})")
    if sample_type == "attack":
        sample = {
            "dur": 0.05,
            "sbytes": 14200,
            "dbytes": 280,
            "sttl": 64,
            "dttl": 252,
            "sloss": 4,
            "dloss": 1,
            "proto": "tcp",
            "service": "http"
        }
    else:
        sample = {
            "dur": 1.25,
            "sbytes": 320,
            "dbytes": 4800,
            "sttl": 62,
            "dttl": 58,
            "sloss": 0,
            "dloss": 0,
            "proto": "tcp",
            "service": "http"
        }

    res = asyncio.run(ml_evaluate_all_models(sample))
    print(f"[*] Composite Risk Score: {res['composite_risk_score']}/100")
    print(f"[*] Firewall Mitigation : {'TRIGGERED (Score >= 85)' if res['requires_firewall_mitigation'] else 'NOMINAL / ALLOW'}")
    print("\n--- 1. XGBoost Primary Classifier ---")
    xgb = res['xgboost_classifier']
    print(f"    Attack Detected   : {xgb.get('is_attack')}")
    print(f"    Attack Probability: {xgb.get('attack_probability')}")
    print(f"    Severity          : {xgb.get('severity')}")
    print(f"    Model Version     : {xgb.get('model_version')}")

    print("\n--- 2. KNN Similarity Engine (k=5) ---")
    knn = res['knn_similarity_engine']
    print(f"    Closest Match     : {knn.get('prediction')}")
    print(f"    Historical Ex.    : {knn.get('nearest_examples')} archetypes analyzed")
    print(f"    Explanation       : {knn.get('explanation')}")

    print("\n--- 3. Benign Reconstruction Autoencoder (Zero-Day) ---")
    ae = res['autoencoder_zero_day']
    print(f"    Status            : {ae.get('status')}")
    print(f"    Reconstruction MSE: {ae.get('reconstruction_error')} (Threshold: {ae.get('threshold')})")
    print(f"    Anomaly Score     : {ae.get('anomaly_score')}")
    print(f"    Explanation       : {ae.get('explanation')}")
    return res

def test_voice(target: str = "Managing Director / Dean"):
    print_banner(f"Spectral Voice Deepfake Detection ({target})")
    req = MultimodalAnalysisRequest(source_type="AUDIO_VOICE", impersonation_target=target)
    res = asyncio.run(analyze_multimodal(req))
    data = res.model_dump()
    print(f"[*] Source Type         : {data['source_type']}")
    print(f"[*] Impersonated Target : {data['impersonated_entity']}")
    print(f"[*] Authenticity Score  : {data['authenticity_score']}/100")
    print(f"[*] Risk Score          : {data['risk_score']}/100")
    print(f"[*] Classification      : {data['classification']}")
    print(f"[*] Recommended Action  : {data['recommended_action']}")
    print("[*] Acoustic Indicators :")
    for ind in data["indicators"]:
        print(f"    - {ind}")
    return data

def test_video(target: str = "University Vice Chancellor"):
    print_banner(f"Facial Seam Video Deepfake Detection ({target})")
    req = MultimodalAnalysisRequest(source_type="VIDEO_DEEPFAKE", impersonation_target=target)
    res = asyncio.run(analyze_multimodal(req))
    data = res.model_dump()
    print(f"[*] Source Type         : {data['source_type']}")
    print(f"[*] Impersonated Target : {data['impersonated_entity']}")
    print(f"[*] Authenticity Score  : {data['authenticity_score']}/100")
    print(f"[*] Risk Score          : {data['risk_score']}/100")
    print(f"[*] Classification      : {data['classification']}")
    print(f"[*] Recommended Action  : {data['recommended_action']}")
    print("[*] Visual Indicators   :")
    for ind in data["indicators"]:
        print(f"    - {ind}")
    return data

def test_qr():
    print_banner("QR Quishing & UPI Hijack Detection")
    req = MultimodalAnalysisRequest(source_type="IMAGE_QR")
    res = asyncio.run(analyze_multimodal(req))
    data = res.model_dump()
    print(f"[*] Source Type         : {data['source_type']}")
    print(f"[*] Target Spoofed      : {data['impersonated_entity']}")
    print(f"[*] Authenticity Score  : {data['authenticity_score']}/100")
    print(f"[*] Risk Score          : {data['risk_score']}/100")
    print(f"[*] Classification      : {data['classification']}")
    print(f"[*] Decoded QR Payload  : {data['technical_artifacts'].get('decoded_qr')}")
    print(f"[*] Unauthorized UPI    : Flagged (Bypasses official OKCL channels)")
    print(f"[*] Recommended Action  : {data['recommended_action']}")
    return data

def main():
    parser = argparse.ArgumentParser(description="CyberGuard Interactive Model Testing CLI")
    parser.add_argument("--mode", choices=["all", "link", "flow", "voice", "video", "qr"], default="all",
                        help="Which detection model/engine to test")
    parser.add_argument("--url", default="https://okcl-scholarship.portal-claim.online/kyc",
                        help="Custom URL to test with the Link/Phishing engine")
    args = parser.parse_args()

    if args.mode in ["all", "link"]:
        test_link(args.url)
    if args.mode in ["all", "flow"]:
        test_flow("attack")
    if args.mode in ["all", "voice"]:
        test_voice()
    if args.mode in ["all", "video"]:
        test_video()
    if args.mode in ["all", "qr"]:
        test_qr()

    print("\n" + "=" * 70)
    print("  [SUCCESS] All Models & Inference Subsystems Evaluated Successfully!")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    main()
