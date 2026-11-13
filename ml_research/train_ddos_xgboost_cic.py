"""
Specialized DDoS Classifier Training Pipeline using XGBoost & CIC Dataset
Architecture:
  - Multi-class and Binary DDoS/DoS Attack Vector Classification
  - Trains on extensive network flow features (80+ flow metrics: packet rates, inter-arrival times, window sizes)
  - Outputs DDoS category, confidence score, and routes to CyberGuard Risk Engine.

Supported Attack Families:
  - DDoS (High-rate Volumetric LOIC/HOIC)
  - DoS Hulk
  - DoS GoldenEye
  - DoS Slowloris
  - DoS Slowhttptest
  - Portscan / Probing
  - Benign / Nominal

Exports:
  - ddos_xgboost_model.joblib
  - ddos_feature_names.joblib
  - ddos_label_encoder.joblib
"""

import os
import zipfile
import io
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score
import xgboost as xgb

# =====================================================================
# STEP 1: Load Parquet Files from CIC Dataset ZIP
# =====================================================================
os.makedirs("artifacts", exist_ok=True)
os.makedirs(os.path.join("backend", "ml_models"), exist_ok=True)

zip_candidates = [
    r"C:\Users\bishn\Downloads\cic dataseet.zip",
    "cic dataseet.zip",
    "../cic dataseet.zip"
]

zip_path = None
for z in zip_candidates:
    if os.path.exists(z):
        zip_path = z
        break

if not zip_path:
    raise FileNotFoundError("Could not find 'cic dataseet.zip' file.")

print(f"Loading datasets from ZIP: {zip_path}...")

dfs = []
target_files = [
    ('DDoS-Friday-no-metadata.parquet', 150000),
    ('DoS-Wednesday-no-metadata.parquet', 150000),
    ('Portscan-Friday-no-metadata.parquet', 80000),
    ('Benign-Monday-no-metadata.parquet', 100000)
]

with zipfile.ZipFile(zip_path, 'r') as archive:
    available_files = archive.namelist()
    print("Files available inside ZIP:", available_files)
    
    for filename, sample_limit in target_files:
        if filename in available_files:
            print(f"Reading {filename}...")
            with archive.open(filename) as f:
                df = pd.read_parquet(f)
                if len(df) > sample_limit:
                    df = df.sample(n=sample_limit, random_state=42)
                dfs.append(df)

df_all = pd.concat(dfs, ignore_index=True)
print(f"\n[DATASET COMBINED] Total Flow Records: {df_all.shape[0]} across {df_all.shape[1]} columns")

# Standardize Label column name
label_col = 'Label' if 'Label' in df_all.columns else 'label'
df_all[label_col] = df_all[label_col].astype(str).str.strip()

print("\nDDoS / DoS Attack Distribution:")
print(df_all[label_col].value_counts())

# =====================================================================
# STEP 2: Feature Engineering & Preprocessing
# =====================================================================
# Strip leading/trailing spaces from column headers
df_all.columns = [c.strip() for c in df_all.columns]
label_col = 'Label' if 'Label' in df_all.columns else 'label'

# Drop non-predictive metadata or identifier columns if any
drop_meta = ['Timestamp', 'Flow ID', 'Source IP', 'Destination IP', 'SimillarHTTP', 'Unnamed: 0']
drop_cols = [c for c in drop_meta if c in df_all.columns] + [label_col]

X = df_all.drop(columns=drop_cols)
y = df_all[label_col]

# Handle infinite and NaN values (common in network flow rate divisions)
X = X.replace([np.inf, -np.inf], np.nan)
X = X.fillna(0.0)

# Convert all feature columns to float32
feature_names = X.columns.tolist()
X = X.astype(np.float32)

# Encode Multi-class Target Labels
le = LabelEncoder()
y_encoded = le.fit_transform(y)
class_names = le.classes_.tolist()

print(f"\nFeatures ({len(feature_names)} total):", feature_names[:10], "...")
print("Classes to classify:", class_names)

# Stratified Train/Test Split (80/20)
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.20, random_state=42, stratify=y_encoded
)

print(f"Train Shape: {X_train.shape} | Test Shape: {X_test.shape}")

# =====================================================================
# STEP 3: Train High-Throughput Specialized XGBoost DDoS Model
# =====================================================================
print("\nTraining Specialized XGBoost DDoS Classifier...")

num_classes = len(class_names)
is_multiclass = num_classes > 2

xgb_ddos = xgb.XGBClassifier(
    n_estimators=250,
    max_depth=7,
    learning_rate=0.08,
    subsample=0.85,
    colsample_bytree=0.85,
    tree_method='hist',
    objective='multi:softprob' if is_multiclass else 'binary:logistic',
    num_class=num_classes if is_multiclass else None,
    eval_metric='mlogloss' if is_multiclass else 'logloss',
    random_state=42,
    n_jobs=-1
)

xgb_ddos.fit(
    X_train, y_train,
    eval_set=[(X_train, y_train), (X_test, y_test)],
    verbose=50
)

# =====================================================================
# STEP 4: Evaluation & Performance Metrics
# =====================================================================
print("\n================ EVALUATION ON UNSEEN CIC TEST TRAFFIC ================")
y_pred = xgb_ddos.predict(X_test)
y_proba = xgb_ddos.predict_proba(X_test)

acc = accuracy_score(y_test, y_pred)
print(f"[METRIC] DDoS Classification Accuracy: {acc * 100:.2f}%\n")
print(classification_report(y_test, y_pred, target_names=class_names, digits=4))

# Top 15 Feature Importances
importance_df = pd.DataFrame({
    'Feature': feature_names,
    'Importance': xgb_ddos.feature_importances_
}).sort_values(by='Importance', ascending=False)

print("\nTop 10 Most Discriminative DDoS Telemetry Features:")
print(importance_df.head(10).to_string(index=False))

# =====================================================================
# STEP 5: Demonstration Single Flow DDoS Inspection & Risk Routing
# =====================================================================
def inspect_ddos_flow(sample_vec):
    probs = xgb_ddos.predict_proba(sample_vec)[0]
    pred_idx = int(np.argmax(probs))
    pred_class = class_names[pred_idx]
    confidence = float(probs[pred_idx])
    
    is_ddos = (pred_class != "Benign")
    
    # Calculate Risk Score for Risk Engine
    if not is_ddos:
        risk_score = int(max(1, (1.0 - confidence) * 30))
        severity = "LOW"
    else:
        risk_score = int(min(99, max(60, confidence * 100)))
        severity = "CRITICAL" if risk_score >= 85 else "HIGH"
        
    return {
        "is_ddos": is_ddos,
        "attack_family": pred_class,
        "ddos_confidence": round(confidence, 4),
        "risk_score": risk_score,
        "severity": severity,
        "mitigation_action": "TRIGGER_BGP_RATE_LIMIT_AND_IP_BLOCK" if severity == "CRITICAL" else "MONITOR_FLOW",
        "explanation": f"Specialized DDoS Engine detected {pred_class} with {int(confidence * 100)}% certainty." if is_ddos else "Nominal benign network telemetry."
    }

# Test on actual DDoS packet
ddos_test_sample = X_test[y_test == class_names.index('DDoS')].iloc[0:1]
print("\n=== DEMO INFERENCE OUTPUT FOR CYBERGUARD UI ===")
print(json.dumps(inspect_ddos_flow(ddos_test_sample), indent=2))

# =====================================================================
# STEP 6: Export Artifacts for CyberGuard Backend
# =====================================================================
model_path = os.path.join("artifacts", "ddos_xgboost_model.joblib")
feat_path = os.path.join("artifacts", "ddos_feature_names.joblib")
enc_path = os.path.join("artifacts", "ddos_label_encoder.joblib")

joblib.dump(xgb_ddos, model_path)
joblib.dump(feature_names, feat_path)
joblib.dump(le, enc_path)

# Copy directly to backend/ml_models/
backend_model = os.path.join("backend", "ml_models", "ddos_xgboost_model.joblib")
backend_feat = os.path.join("backend", "ml_models", "ddos_feature_names.joblib")
backend_enc = os.path.join("backend", "ml_models", "ddos_label_encoder.joblib")

joblib.dump(xgb_ddos, backend_model)
joblib.dump(feature_names, backend_feat)
joblib.dump(le, backend_enc)

print(f"\n[OK] DDoS XGBoost Model saved to: {model_path} & {backend_model}")
print(f"[OK] DDoS Feature Manifest saved to: {feat_path} & {backend_feat}")
print(f"[OK] DDoS Label Encoder saved to: {enc_path} & {backend_enc}")
