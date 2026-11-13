import os
from pathlib import Path
from typing import Dict, List, Any, Optional
import numpy as np
import pandas as pd
import joblib

class XGBoostUNSWPredictor:
    """
    Primary Classifier: Production-grade XGBoost UNSW-NB15 Inference Service.
    Predicts attack probability and binary flow legitimacy.
    """
    def __init__(self):
        self.model_dir = Path(__file__).parent / "ml_models"
        self.model_file = self.model_dir / "xgboost_unsw_nb15.joblib"
        self.encoders_file = self.model_dir / "label_encoders.joblib"
        self.features_file = self.model_dir / "feature_names.joblib"

        self.model = None
        self.encoders = {}
        self.feature_names = []
        self.is_loaded = False
        self.load_model()

    def load_model(self):
        try:
            if self.model_file.exists() and self.encoders_file.exists() and self.features_file.exists():
                self.model = joblib.load(self.model_file)
                self.encoders = joblib.load(self.encoders_file)
                self.feature_names = joblib.load(self.features_file)
                self.is_loaded = True
                print(f"[XGBoost Service] Successfully initialized UNSW-NB15 Primary Classifier.")
            else:
                print(f"[XGBoost Service] Model files not found in {self.model_dir}.")
        except Exception as e:
            print(f"[XGBoost Service] Error loading XGBoost model: {e}")
            self.is_loaded = False

    def predict_flow(self, flow_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_loaded or self.model is None:
            return {
                "status": "FALLBACK_HEURISTIC",
                "is_attack": False,
                "attack_probability": 0.0,
                "risk_score": 10,
                "model_version": "Heuristic fallback (Model not loaded)"
            }

        row = {}
        for feat in self.feature_names:
            val = flow_data.get(feat, 0)
            if feat in self.encoders:
                le = self.encoders[feat]
                val_str = str(val)
                if val_str in le.classes_:
                    val = le.transform([val_str])[0]
                else:
                    val = 0
            try:
                row[feat] = float(val)
            except (ValueError, TypeError):
                row[feat] = 0.0

        df_sample = pd.DataFrame([row])[self.feature_names]
        df_sample = df_sample.replace([np.inf, -np.inf], np.nan).fillna(0)

        prob = float(self.model.predict_proba(df_sample)[0, 1])
        is_attack = bool(prob >= 0.5)
        risk_score = int(min(99, max(1, prob * 100)))

        if risk_score >= 85:
            severity = "CRITICAL"
        elif risk_score >= 70:
            severity = "HIGH"
        elif risk_score >= 40:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        return {
            "status": "INFERENCE_SUCCESS",
            "is_attack": is_attack,
            "attack_probability": round(prob, 4),
            "risk_score": risk_score,
            "severity": severity,
            "model_version": "XGBoost v4.19 (Primary Classifier)",
            "requires_mitigation": risk_score >= 85
        }


class KNNSimilarityEngine:
    """
    Similarity Intelligence Engine: KNN + StandardScaler on UNSW-NB15 dataset.
    Finds nearest historical attack flows, computes similarity confidence,
    and explains why a flow was classified as suspicious.
    """
    def __init__(self):
        self.model_dir = Path(__file__).parent / "ml_models"
        self.knn_file = self.model_dir / "knn_unsw_nb15.joblib"
        self.scaler_file = self.model_dir / "knn_scaler.joblib"
        self.ref_file = self.model_dir / "knn_reference_samples.joblib"

        self.knn_model = None
        self.scaler = None
        self.ref_metadata = None
        self.feature_names = []
        self.encoders = {}
        self.is_loaded = False
        self.load_engine()

    def load_engine(self):
        try:
            if self.knn_file.exists() and self.scaler_file.exists() and self.ref_file.exists():
                self.knn_model = joblib.load(self.knn_file)
                self.scaler = joblib.load(self.scaler_file)
                ref_payload = joblib.load(self.ref_file)
                
                self.ref_metadata = ref_payload.get('metadata')
                self.feature_names = ref_payload.get('features', [])
                self.encoders = ref_payload.get('encoders', {})
                self.is_loaded = True
                print(f"[KNN Engine] Successfully initialized Similarity Intelligence ({len(self.ref_metadata)} historical archetypes).")
            else:
                print(f"[KNN Engine] KNN artifacts missing in {self.model_dir}.")
        except Exception as e:
            print(f"[KNN Engine] Error loading KNN similarity engine: {e}")
            self.is_loaded = False

    def query_similarity(self, flow_data: Dict[str, Any], k: int = 5) -> Dict[str, Any]:
        if not self.is_loaded or self.knn_model is None or self.scaler is None:
            return {
                "prediction": "Normal",
                "similarity_confidence": 0.50,
                "nearest_examples": 0,
                "explanation": "KNN similarity engine offline",
                "nearest_historical_flows": []
            }

        row = {}
        for feat in self.feature_names:
            val = flow_data.get(feat, 0)
            if feat in self.encoders:
                le = self.encoders[feat]
                val_str = str(val)
                if val_str in le.classes_:
                    val = le.transform([val_str])[0]
                else:
                    val = 0
            try:
                row[feat] = float(val)
            except (ValueError, TypeError):
                row[feat] = 0.0

        df_sample = pd.DataFrame([row])[self.feature_names].astype(np.float32)
        df_sample = df_sample.replace([np.inf, -np.inf], np.nan).fillna(0)

        scaled_vec = self.scaler.transform(df_sample)
        distances, indices = self.knn_model.kneighbors(scaled_vec, n_neighbors=k)
        
        nearest_rows = self.ref_metadata.iloc[indices[0]].copy()
        avg_dist = float(np.mean(distances[0]))
        similarity_conf = round(float(1.0 / (1.0 + (avg_dist / 2.0))), 2)

        dominant_cat = str(nearest_rows['attack_cat'].mode()[0])
        category_counts = nearest_rows['attack_cat'].value_counts().to_dict()

        flow_summaries = []
        for _, r in nearest_rows.iterrows():
            flow_summaries.append({
                "attack_cat": str(r.get('attack_cat', 'Unknown')),
                "proto": str(r.get('proto', '-')),
                "service": str(r.get('service', '-')),
                "duration": round(float(r.get('dur', 0.0)), 4),
                "src_bytes": int(r.get('sbytes', 0)),
                "dst_bytes": int(r.get('dbytes', 0))
            })

        explanation = f"Similar to previous {dominant_cat} traffic (KNN signature match: {int(similarity_conf * 100)}%)"

        return {
            "prediction": dominant_cat,
            "similarity_confidence": similarity_conf,
            "nearest_examples": k,
            "category_distribution": category_counts,
            "explanation": explanation,
            "nearest_historical_flows": flow_summaries
        }


class AutoencoderAnomalyDetector:
    """
    Unsupervised Zero-Day / Novel Anomaly Detector.
    Trained exclusively on pure BENIGN network traffic.
    Reconstruction Error (MSE) > Threshold => ANOMALOUS (Novel / Zero-Day Pattern)
    """
    def __init__(self):
        self.model_dir = Path(__file__).parent / "ml_models"
        self.ae_file = self.model_dir / "autoencoder_unsw_nb15.joblib"
        self.meta_file = self.model_dir / "autoencoder_metadata.joblib"

        self.model = None
        self.scaler = None
        self.threshold = 0.02
        self.max_benign_err = 0.05
        self.feature_names = []
        self.encoders = {}
        self.is_loaded = False
        self.load_model()

    def load_model(self):
        try:
            if self.ae_file.exists() and self.meta_file.exists():
                self.model = joblib.load(self.ae_file)
                meta = joblib.load(self.meta_file)
                self.threshold = float(meta.get('threshold', 0.02))
                self.max_benign_err = float(meta.get('max_benign_err', 0.05))
                self.scaler = meta.get('scaler')
                self.feature_names = meta.get('features', [])
                self.encoders = meta.get('encoders', {})
                self.is_loaded = True
                print(f"[Autoencoder] Successfully loaded Benign Anomaly Detector (Threshold MSE: {self.threshold:.6f}).")
            else:
                print(f"[Autoencoder] Model files not found in {self.model_dir}.")
        except Exception as e:
            print(f"[Autoencoder] Error loading model: {e}")
            self.is_loaded = False

    def detect_anomaly(self, flow_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates reconstruction error and returns anomaly score.
        Output:
        {
          "anomaly_score": 0.94,
          "reconstruction_error": 0.0842,
          "threshold": 0.0215,
          "status": "ANOMALOUS",
          "explanation": "High reconstruction error detected; deviation from learned benign baseline"
        }
        """
        if not self.is_loaded or self.model is None or self.scaler is None:
            return {
                "anomaly_score": 0.10,
                "reconstruction_error": 0.0,
                "threshold": self.threshold,
                "status": "NORMAL",
                "explanation": "Autoencoder offline; fallback nominal"
            }

        row = {}
        for feat in self.feature_names:
            val = flow_data.get(feat, 0)
            if feat in self.encoders:
                le = self.encoders[feat]
                val_str = str(val)
                if val_str in le.classes_:
                    val = le.transform([val_str])[0]
                else:
                    val = 0
            try:
                row[feat] = float(val)
            except (ValueError, TypeError):
                row[feat] = 0.0

        # Apply log1p normalization on skewed flow volume features
        for col in ['dur', 'sbytes', 'dbytes', 'rate', 'sload', 'dload', 'sinpkt', 'dinpkt', 'sjit', 'djit', 'stcpb', 'dtcpb']:
            if col in row:
                row[col] = np.log1p(max(0.0, float(row[col])))

        df_sample = pd.DataFrame([row])[self.feature_names].astype(np.float32)
        df_sample = df_sample.replace([np.inf, -np.inf], np.nan).fillna(0)

        scaled_vec = self.scaler.transform(df_sample)
        reconstruction = self.model.predict(scaled_vec)
        recon_error = float(np.mean((scaled_vec - reconstruction) ** 2))

        # Normalized anomaly score 0.0 -> 1.0
        if recon_error <= self.threshold:
            norm_score = (recon_error / max(1e-6, self.threshold)) * 0.5
        else:
            norm_score = 0.5 + min(0.5, ((recon_error - self.threshold) / max(1e-6, self.max_benign_err * 2.0)) * 0.5)

        anomaly_score = round(float(np.clip(norm_score, 0.01, 0.99)), 2)
        status = "ANOMALOUS" if recon_error > self.threshold else "NORMAL"

        return {
            "anomaly_score": anomaly_score,
            "reconstruction_error": round(recon_error, 6),
            "threshold": round(self.threshold, 6),
            "status": status,
            "explanation": "High reconstruction error detected; deviation from learned benign baseline" if status == "ANOMALOUS" else "Low reconstruction error; conforms to benign baseline manifold."
        }


# Singleton service instances
xgboost_service = XGBoostUNSWPredictor()
knn_service = KNNSimilarityEngine()
autoencoder_service = AutoencoderAnomalyDetector()
