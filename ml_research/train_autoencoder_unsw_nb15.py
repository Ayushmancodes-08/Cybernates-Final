"""
UNSW-NB15 Flow Autoencoder Anomaly Detection Engine (Zero-Day / Novel Threat Detector)
Implemented using Scikit-Learn MLPRegressor / PyTorch compatible dual fallback.
Architecture:
  - Trained exclusively on BENIGN (Normal) network traffic.
  - Learns latent baseline manifold of normal network transactions (bottleneck compression).
  - High Reconstruction Error (MSE) -> Novel / Zero-Day Anomaly.
  - Low Reconstruction Error (MSE) -> Normal Benign Traffic.

Output Schema:
{
  "anomaly_score": 0.94,
  "reconstruction_error": 0.0842,
  "threshold": 0.0215,
  "status": "ANOMALOUS",
  "explanation": "High reconstruction error detected; deviation from learned benign baseline."
}
"""

import os
import glob
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.neural_network import MLPRegressor
from sklearn.metrics import classification_report, roc_auc_score

# =====================================================================
# STEP 1: Paths & Dataset Loading
# =====================================================================
os.makedirs("artifacts", exist_ok=True)
os.makedirs(os.path.join("backend", "ml_models"), exist_ok=True)

possible_dirs = [
    r"C:\Users\bishn\Downloads\Dataset1",
    os.path.join("..", "Dataset1"),
    os.path.join(".", "data")
]

train_df = None
test_df = None

for pdir in possible_dirs:
    if os.path.exists(pdir):
        parquet_train = os.path.join(pdir, "UNSW_NB15_training-set.parquet")
        parquet_test = os.path.join(pdir, "UNSW_NB15_testing-set.parquet")
        csv_train = os.path.join(pdir, "UNSW_NB15_training-set.csv")
        csv_test = os.path.join(pdir, "UNSW_NB15_testing-set.csv")

        if os.path.exists(parquet_train) and os.path.exists(parquet_test):
            print(f"Loading Parquet from {pdir}...")
            train_df = pd.read_parquet(parquet_train)
            test_df = pd.read_parquet(parquet_test)
            break
        elif os.path.exists(csv_train) and os.path.exists(csv_test):
            print(f"Loading CSV from {pdir}...")
            train_df = pd.read_csv(csv_train)
            test_df = pd.read_csv(csv_test)
            break

if train_df is None or test_df is None:
    raise FileNotFoundError("Could not find UNSW-NB15 dataset files.")

for df in [train_df, test_df]:
    if 'id' in df.columns:
        df.drop(columns=['id'], inplace=True)
    if 'attack_cat' in df.columns:
        df['attack_cat'] = df['attack_cat'].fillna('Normal').astype(str).str.strip()

print(f"Dataset Loaded -> Train: {train_df.shape}, Test: {test_df.shape}")

# =====================================================================
# STEP 2: Preprocessing & Encoders
# =====================================================================
drop_cols = ['label', 'attack_cat']
feature_cols = [c for c in train_df.columns if c not in drop_cols]

X_train_full = train_df[feature_cols].copy()
y_train_label = train_df['label'].copy()

X_test_full = test_df[feature_cols].copy()
y_test_label = test_df['label'].copy()
y_test_cat = test_df['attack_cat'].copy()

# Categorical column encoding
cat_cols = X_train_full.select_dtypes(include=['object', 'category']).columns.tolist()
encoders = {}
for col in cat_cols:
    le = LabelEncoder()
    combined = pd.concat([X_train_full[col].astype(str), X_test_full[col].astype(str)], axis=0)
    le.fit(combined)
    X_train_full[col] = le.transform(X_train_full[col].astype(str))
    X_test_full[col] = le.transform(X_test_full[col].astype(str))
    encoders[col] = le

# Apply log1p on skewed flow counters
skewed_cols = ['dur', 'sbytes', 'dbytes', 'rate', 'sload', 'dload', 'sinpkt', 'dinpkt', 'sjit', 'djit', 'stcpb', 'dtcpb']
for col in skewed_cols:
    if col in X_train_full.columns:
        X_train_full[col] = np.log1p(np.maximum(0, X_train_full[col].astype(np.float32)))
        X_test_full[col] = np.log1p(np.maximum(0, X_test_full[col].astype(np.float32)))

X_train_full = X_train_full.astype(np.float32).replace([np.inf, -np.inf], np.nan).fillna(0)
X_test_full = X_test_full.astype(np.float32).replace([np.inf, -np.inf], np.nan).fillna(0)

# =====================================================================
# STEP 3: Train EXCLUSIVELY on Pure BENIGN (Normal) Network Traffic
# =====================================================================
benign_mask = (y_train_label == 0)
X_train_benign = X_train_full[benign_mask].copy()

print(f"\n[BENIGN TRAINING SET] Total Normal Flows: {X_train_benign.shape[0]}")
print(f"[TEST EVALUATION SET] Total Flows (Benign + Anomalies): {X_test_full.shape[0]}")

# Scale using StandardScaler fitted exclusively on benign traffic
scaler = StandardScaler()
X_train_benign_scaled = scaler.fit_transform(X_train_benign)
X_test_scaled = scaler.transform(X_test_full)

# =====================================================================
# STEP 4: Train Bottleneck Autoencoder Architecture
# Encoder: (input_dim -> 32 -> 16 -> 8) | Decoder: (8 -> 16 -> 32 -> input_dim)
# =====================================================================
input_dim = len(feature_cols)
print(f"\nTraining Autoencoder Neural Network on Normal Baseline (Input Dimension: {input_dim})...")

# MLPRegressor configured as an identity autoencoder (X_train_benign -> X_train_benign)
autoencoder = MLPRegressor(
    hidden_layer_sizes=(48, 24, 12, 24, 48),  # Bottleneck layer = 12 latent dimensions
    activation='relu',
    solver='adam',
    alpha=1e-4,
    batch_size=256,
    learning_rate_init=0.003,
    max_iter=30,
    random_state=42,
    verbose=True,
    early_stopping=True,
    validation_fraction=0.1
)

autoencoder.fit(X_train_benign_scaled, X_train_benign_scaled)

# =====================================================================
# STEP 5: Calculate Anomaly Threshold from Benign Baseline Reconstruction
# =====================================================================
benign_recon = autoencoder.predict(X_train_benign_scaled)
benign_errors = np.mean((X_train_benign_scaled - benign_recon) ** 2, axis=1)

# Threshold at 97.5th percentile of normal traffic error
threshold = float(np.percentile(benign_errors, 97.5))
max_benign_err = float(np.percentile(benign_errors, 99.5))
print(f"\n[BENIGN BASELINE] Mean Error: {benign_errors.mean():.6f} | 97.5% Anomaly Threshold: {threshold:.6f}")

# =====================================================================
# STEP 6: Evaluate Anomaly Detection on Test Dataset
# =====================================================================
test_recon = autoencoder.predict(X_test_scaled)
test_errors = np.mean((X_test_scaled - test_recon) ** 2, axis=1)

y_pred_anomaly = (test_errors > threshold).astype(int)
auc = roc_auc_score(y_test_label, test_errors)

print(f"\n================ AUTOENCODER EVALUATION METRICS ================")
print(f"ROC-AUC Score: {auc:.4f}")
print("\nClassification Report (0 = Normal, 1 = Anomaly/Attack):")
print(classification_report(y_test_label, y_pred_anomaly, target_names=["Normal", "Anomaly"]))

# Check breakdown across unknown attack families
eval_df = pd.DataFrame({
    'attack_cat': y_test_cat,
    'error': test_errors,
    'is_flagged_anomaly': y_pred_anomaly
})
print("\nAnomaly Flagging Rate Across Attack Categories:")
rates = eval_df.groupby('attack_cat')['is_flagged_anomaly'].mean() * 100
for cat, rate in rates.items():
    print(f"  - {cat:16s}: {rate:5.1f}% flagged as Anomaly")

# =====================================================================
# STEP 7: Example Single Flow Anomaly Score Output
# =====================================================================
def compute_anomaly(sample_vec):
    recon = autoencoder.predict(sample_vec)
    err = float(np.mean((sample_vec - recon) ** 2))
    
    if err <= threshold:
        norm_score = (err / threshold) * 0.5
    else:
        norm_score = 0.5 + min(0.5, ((err - threshold) / (max_benign_err * 2)) * 0.5)
    
    anomaly_score = round(float(np.clip(norm_score, 0.01, 0.99)), 2)
    status = "ANOMALOUS" if err > threshold else "NORMAL"
    
    return {
        "anomaly_score": anomaly_score,
        "reconstruction_error": round(err, 6),
        "threshold": round(threshold, 6),
        "status": status,
        "explanation": "High reconstruction error detected; deviation from learned benign baseline" if status == "ANOMALOUS" else "Low reconstruction error; conforms to benign baseline manifold."
    }

demo_sample = X_test_scaled[0:1]
print("\n=== DEMO INFERENCE OUTPUT FOR CYBERGUARD UI ===")
print(json.dumps(compute_anomaly(demo_sample), indent=2))

# =====================================================================
# STEP 8: Export Model Artifacts (.joblib)
# =====================================================================
autoencoder_path = os.path.join("artifacts", "autoencoder_unsw_nb15.joblib")
meta_path = os.path.join("artifacts", "autoencoder_metadata.joblib")

payload = {
    'threshold': threshold,
    'max_benign_err': max_benign_err,
    'scaler': scaler,
    'features': feature_cols,
    'encoders': encoders,
    'input_dim': input_dim
}

joblib.dump(autoencoder, autoencoder_path)
joblib.dump(payload, meta_path)

# Deploy to backend/ml_models/
backend_ae = os.path.join("backend", "ml_models", "autoencoder_unsw_nb15.joblib")
backend_meta = os.path.join("backend", "ml_models", "autoencoder_metadata.joblib")

joblib.dump(autoencoder, backend_ae)
joblib.dump(payload, backend_meta)

print(f"\n[OK] Autoencoder model saved to: {autoencoder_path} & {backend_ae}")
print(f"[OK] Autoencoder metadata saved to: {meta_path} & {backend_meta}")
