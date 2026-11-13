from typing import Dict, List, Any

class DeterministicRiskEngine:
    """
    Authoritative deterministic risk engine for CyberGuard.
    Combines threat telemetry, CVSS-based impact, asset criticality,
    repetition factor, and anomaly severity into an explainable 0-100 score.
    """

    @staticmethod
    def calculate_risk(
        base_severity: str,
        asset_criticality: str = "HIGH",
        packet_rate_factor: float = 1.0,
        known_threat_feed_match: bool = False,
        anomaly_confidence: float = 0.95
    ) -> Dict[str, Any]:
        severity_weights = {
            "CRITICAL": 60,
            "HIGH": 45,
            "MEDIUM": 25,
            "LOW": 10
        }
        criticality_weights = {
            "CRITICAL": 25,
            "HIGH": 20,
            "MEDIUM": 12,
            "LOW": 5
        }

        base = severity_weights.get(base_severity.upper(), 20)
        asset_comp = criticality_weights.get(asset_criticality.upper(), 15)
        feed_comp = 15 if known_threat_feed_match else 0
        rate_comp = min(15, int(packet_rate_factor * 5))

        raw_score = (base + asset_comp + feed_comp + rate_comp) * anomaly_confidence
        final_score = min(99, max(1, int(raw_score)))

        rationale = [
            f"Base Threat Vector Severity ({base_severity}): +{base} pts",
            f"Asset Exposure Criticality ({asset_criticality}): +{asset_comp} pts",
            f"Global Threat Intelligence Corroboration: +{feed_comp} pts",
            f"Telemetry Anomaly Velocity Modifier: +{rate_comp} pts",
            f"Confidence Scaling Factor: {int(anomaly_confidence * 100)}%"
        ]

        category = "CRITICAL" if final_score >= 85 else "HIGH" if final_score >= 70 else "MEDIUM" if final_score >= 40 else "LOW"

        return {
            "score": final_score,
            "category": category,
            "rationale": rationale,
            "requires_autonomous_mitigation": final_score >= 85
        }

risk_engine = DeterministicRiskEngine()
