"""
UNSW-NB15 Intrusion Detection System (IDS) Training Pipeline using XGBoost
Compatible with: Google Colab & Local Jupyter Notebook
Exports: Trained XGBoost Model & Preprocessor artifacts for CyberGuard integration
"""

# =====================================================================
# STEP 1: Dependencies Installation & Imports
# =====================================================================
# Run in notebook cell: !pip install xgboost scikit-learn pandas numpy joblib matplotlib seaborn

import os
import urllib.request
import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    accuracy_score,
    f1_score,
    precision_score,
    recall_score
)
import xgboost as xgb

# =====================================================================
# STEP 2: Download & Load UNSW-NB15 Dataset
# =====================================================================
TRAIN_URL = "https://raw.githubusercontent.com/OptimalCyber/Datasets/main/UNSW-NB15/UNSW_NB15_training-set.csv"
TEST_URL = "https://raw.githubusercontent.com/OptimalCyber/Datasets/main/UNSW-NB15/UNSW_NB15_testing-set.csv"

# Alternative official/mirror fallback URLs if above is unavailable:
# TRAIN_URL = "https://cloudstor.aarnet.edu.au/plus/s/2DhnLGDdEECo4ys/download?path=%2F&files=UNSW_NB15_training-set.csv"

os.makedirs("data", exist_ok=True)
os.makedirs("artifacts", exist_ok=True)

train_path = os.path.join("data", "UNSW_NB15_training-set.csv")
test_path = os.path.join("data", "UNSW_NB15_testing-set.csv")

if not os.path.exists(train_path):
    print("Downloading UNSW-NB15 training dataset...")
    urllib.request.urlretrieve(TRAIN_URL, train_path)

if not os.path.exists(test_path):
    print("Downloading UNSW-NB15 testing dataset...")
    urllib.request.urlretrieve(TEST_URL, test_path)

df_train = pd.read_csv(train_path)
df_test = pd.read_csv(test_path)

print(f"Loaded Train shape: {df_train.shape}, Test shape: {df_test.shape}")
print(df_train.head(3))

# =====================================================================
# STEP 3: Data Preprocessing & Feature Engineering
# =====================================================================
# Drop identifier column 'id' if present
for df in [df_train, df_test]:
    if 'id' in df.columns:
        df.drop(columns=['id'], inplace=True)

# Binary Target: 'label' (0 = Normal, 1 = Attack)
# Multi-class Target: 'attack_cat' (e.g. Exploits, Fuzzers, DoS, Generic, etc.)
# Here we train on Binary Classification (or adapt for Multi-class)
target_col = 'label'
drop_cols = ['label', 'attack_cat']

X_train = df_train.drop(columns=[c for c in drop_cols if c in df_train.columns])
y_train = df_train[target_col]

X_test = df_test.drop(columns=[c for c in drop_cols if c in df_test.columns])
y_test = df_test[target_col]

# Handle Categorical Features (proto, service, state)
cat_cols = X_train.select_dtypes(include=['object']).columns.tolist()
print("Categorical features to encode:", cat_cols)

encoders = {}
for col in cat_cols:
    le = LabelEncoder()
    # Fit on union of train + test categories to avoid unseen category errors
    combined = pd.concat([X_train[col].astype(str), X_test[col].astype(str)], axis=0)
    le.fit(combined)
    X_train[col] = le.transform(X_train[col].astype(str))
    X_test[col] = le.transform(X_test[col].astype(str))
    encoders[col] = le

# Handle Missing / Inf Values
X_train = X_train.replace([np.inf, -np.inf], np.nan).fillna(0)
X_test = X_test.replace([np.inf, -np.inf], np.nan).fillna(0)

# Save feature column names
feature_names = X_train.columns.tolist()

# =====================================================================
# STEP 4: XGBoost Model Configuration & Training
# =====================================================================
print("\nTraining XGBoost Classifier...")

# Parameters tuned for network intrusion telemetry:
# - colsample_bytree & subsample prevent overfitting on repetitive flow features
# - tree_method='hist' ensures fast GPU/CPU scaling
scale_pos_weight = (len(y_train) - sum(y_train)) / sum(y_train)

model = xgb.XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    scale_pos_weight=scale_pos_weight,
    objective='binary:logistic',
    eval_metric=['logloss', 'auc'],
    random_state=42,
    tree_method='hist'
)

# Fit model with early stopping monitoring test validation
model.fit(
    X_train,
    y_train,
    eval_set=[(X_train, y_train), (X_test, y_test)],
    verbose=50
)

# =====================================================================
# STEP 5: Evaluation & Metrics
# =====================================================================
print("\n================ EVALUATION METRICS ================")
y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:, 1]

acc = accuracy_score(y_test, y_pred)
prec = precision_score(y_test, y_pred)
rec = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
auc = roc_auc_score(y_test, y_proba)

print(f"Accuracy:  {acc * 100:.2f}%")
print(f"Precision: {prec * 100:.2f}%")
print(f"Recall:    {rec * 100:.2f}%")
print(f"F1-Score:  {f1 * 100:.2f}%")
print(f"ROC AUC:   {auc:.4f}")

print("\nClassification Report:\n", classification_report(y_test, y_pred, digits=4))

# Feature Importance
importance = pd.DataFrame({
    'Feature': feature_names,
    'Importance': model.feature_importances_
}).sort_values(by='Importance', ascending=False)

print("\nTop 10 Most Critical Features:")
print(importance.head(10).to_string(index=False))

# =====================================================================
# STEP 6: Save Model & Artifacts for CyberGuard Backend
# =====================================================================
model_path = os.path.join("artifacts", "xgboost_unsw_nb15.joblib")
encoders_path = os.path.join("artifacts", "label_encoders.joblib")
features_path = os.path.join("artifacts", "feature_names.joblib")

joblib.dump(model, model_path)
joblib.dump(encoders, encoders_path)
joblib.dump(feature_names, features_path)

print(f"\n[OK] Model successfully saved to {model_path}")
print(f"[OK] Label encoders saved to {encoders_path}")
print(f"[OK] Feature manifest saved to {features_path}")
