"""
UNSW-NB15 K-Nearest Neighbors (KNN) Similarity & Historical Pattern Intelligence Engine
Role: Historical Traffic Retrieval, Pattern Similarity Confidence & Anomaly Explainability
Pairing: KNN (Similarity Intelligence) + XGBoost (Primary Classification)
Exports:
  - knn_unsw_nb15.joblib (Fitted NearestNeighbors)
  - knn_scaler.joblib (Fitted StandardScaler)
  - knn_reference_samples.joblib (Historical exemplar library with attack metadata)
"""

import os
import glob
import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.neighbors import NearestNeighbors, KNeighborsClassifier
from sklearn.metrics import classification_report, accuracy_score

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
    raise FileNotFoundError("Could not find UNSW-NB15 dataset files in expected locations.")

# Normalize columns
for df in [train_df, test_df]:
    if 'id' in df.columns:
        df.drop(columns=['id'], inplace=True)
    if 'attack_cat' in df.columns:
        df['attack_cat'] = df['attack_cat'].fillna('Normal').astype(str).str.strip()

print(f"Dataset Loaded -> Train: {train_df.shape}, Test: {test_df.shape}")
print("Attack categories breakdown:\n", train_df['attack_cat'].value_counts())

# =====================================================================
# STEP 2: Feature Preprocessing & Encoders
# =====================================================================
drop_cols = ['label', 'attack_cat']
feature_cols = [c for c in train_df.columns if c not in drop_cols]

X_train_raw = train_df[feature_cols].copy()
y_train_label = train_df['label'].copy()
y_train_cat = train_df['attack_cat'].copy()

X_test_raw = test_df[feature_cols].copy()
y_test_label = test_df['label'].copy()
y_test_cat = test_df['attack_cat'].copy()

# Identify all non-numeric columns (object and category dtypes)
cat_cols = X_train_raw.select_dtypes(include=['object', 'category']).columns.tolist()
print(f"Categorical features detected: {cat_cols}")

encoders = {}
for col in cat_cols:
    le = LabelEncoder()
    combined = pd.concat([X_train_raw[col].astype(str), X_test_raw[col].astype(str)], axis=0)
    le.fit(combined)
    X_train_raw[col] = le.transform(X_train_raw[col].astype(str))
    X_test_raw[col] = le.transform(X_test_raw[col].astype(str))
    encoders[col] = le

# Ensure all columns are numeric float64 / float32
X_train_raw = X_train_raw.astype(np.float32).replace([np.inf, -np.inf], np.nan).fillna(0)
X_test_raw = X_test_raw.astype(np.float32).replace([np.inf, -np.inf], np.nan).fillna(0)

# =====================================================================
# STEP 3: Subsample Diverse Reference Memory for Realtime Similarity Engine
# =====================================================================
np.random.seed(42)
SAMPLE_SIZE = 15000

stratified_indices = []
cats = train_df['attack_cat'].unique()
samples_per_cat = max(350, SAMPLE_SIZE // len(cats))

for cat in cats:
    idx = train_df[train_df['attack_cat'] == cat].index
    if len(idx) > samples_per_cat:
        sampled = np.random.choice(idx, size=samples_per_cat, replace=False)
    else:
        sampled = idx.values
    stratified_indices.extend(sampled)

stratified_indices = list(set(stratified_indices))
print(f"Curated {len(stratified_indices)} high-density historical flow exemplars for similarity retrieval.")

X_ref = X_train_raw.iloc[stratified_indices].reset_index(drop=True)
y_ref_cat = y_train_cat.iloc[stratified_indices].reset_index(drop=True)
y_ref_label = y_train_label.iloc[stratified_indices].reset_index(drop=True)

# Contextual metadata for analyst display
ref_metadata = train_df.iloc[stratified_indices][['proto', 'service', 'state', 'dur', 'sbytes', 'dbytes', 'attack_cat', 'label']].copy().reset_index(drop=True)
for c in ['proto', 'service', 'state', 'attack_cat']:
    ref_metadata[c] = ref_metadata[c].astype(str)

# =====================================================================
# STEP 4: Standard Scaler & KNN Fit
# =====================================================================
print("\nFitting StandardScaler on reference flows...")
scaler = StandardScaler()
X_ref_scaled = scaler.fit_transform(X_ref)

K_NEIGHBORS = 5
print(f"Fitting NearestNeighbors similarity index (k={K_NEIGHBORS}, metric=euclidean)...")
knn_model = NearestNeighbors(n_neighbors=K_NEIGHBORS, metric='euclidean', algorithm='kd_tree')
knn_model.fit(X_ref_scaled)

# Train Classifier companion for category consensus validation
knn_clf = KNeighborsClassifier(n_neighbors=K_NEIGHBORS, metric='euclidean', weights='distance')
knn_clf.fit(X_ref_scaled, y_ref_cat)

# =====================================================================
# STEP 5: Model Evaluation on Unseen Test Traffic
# =====================================================================
print("\nEvaluating KNN Pattern Matcher on Test Set (subset of 5000 unseen flows)...")
test_eval_idx = np.random.choice(len(test_df), size=min(5000, len(test_df)), replace=False)
X_test_subset = X_test_raw.iloc[test_eval_idx]
y_test_cat_subset = y_test_cat.iloc[test_eval_idx]

X_test_scaled = scaler.transform(X_test_subset)
y_pred_cat = knn_clf.predict(X_test_scaled)

acc = accuracy_score(y_test_cat_subset, y_pred_cat)
print(f"KNN Category Pattern Matching Accuracy: {acc * 100:.2f}%\n")
print(classification_report(y_test_cat_subset, y_pred_cat, zero_division=0))

# =====================================================================
# STEP 6: Example Similarity Pipeline Run (Testing DoS / Suspicious flow)
# =====================================================================
# Pick an actual DoS sample from test set
dos_idx = test_df[test_df['attack_cat'] == 'DoS'].index
if len(dos_idx) > 0:
    sample_raw = X_test_raw.loc[[dos_idx[0]]]
else:
    sample_raw = X_test_raw.iloc[0:1]

sample_vector = scaler.transform(sample_raw)
distances, indices = knn_model.kneighbors(sample_vector)

nearest_matches = ref_metadata.iloc[indices[0]]
avg_dist = float(np.mean(distances[0]))
similarity_conf = round(float(1.0 / (1.0 + (avg_dist / 2.0))), 4)
dominant_cat = nearest_matches['attack_cat'].mode()[0]

output_demo = {
    "prediction": dominant_cat,
    "similarity_confidence": similarity_conf,
    "nearest_examples": K_NEIGHBORS,
    "explanation": f"Similar to previous {dominant_cat} traffic signatures (Confidence: {int(similarity_conf * 100)}%)",
    "nearest_historical_flows": nearest_matches[['attack_cat', 'proto', 'service', 'dur', 'sbytes', 'dbytes']].to_dict(orient='records')
}
import json
print("\n=== DEMO INFERENCE OUTPUT FOR CYBERGUARD UI ===")
print(json.dumps(output_demo, indent=2))

# =====================================================================
# STEP 7: Export Artifacts
# =====================================================================
knn_path = os.path.join("artifacts", "knn_unsw_nb15.joblib")
scaler_path = os.path.join("artifacts", "knn_scaler.joblib")
ref_data_path = os.path.join("artifacts", "knn_reference_samples.joblib")

payload = {
    'features': feature_cols,
    'metadata': ref_metadata,
    'encoders': encoders
}

joblib.dump(knn_model, knn_path)
joblib.dump(scaler, scaler_path)
joblib.dump(payload, ref_data_path)

# Deploy directly to backend/ml_models
backend_knn = os.path.join("backend", "ml_models", "knn_unsw_nb15.joblib")
backend_scaler = os.path.join("backend", "ml_models", "knn_scaler.joblib")
backend_ref = os.path.join("backend", "ml_models", "knn_reference_samples.joblib")

joblib.dump(knn_model, backend_knn)
joblib.dump(scaler, backend_scaler)
joblib.dump(payload, backend_ref)

print(f"\n[OK] KNN Model saved to {knn_path} & {backend_knn}")
print(f"[OK] Scaler saved to {scaler_path} & {backend_scaler}")
print(f"[OK] Reference library saved to {ref_data_path} & {backend_ref}")
