import json

notebook_content = {
  "cells": [
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": [
        "# 🚨 UNSW-NB15 Deep Autoencoder Anomaly Detection Engine\n",
        "### Unsupervised Zero-Day & Novel Threat Detector\n",
        "\n",
        "This notebook trains an **Autoencoder Neural Network exclusively on BENIGN (Normal) network traffic** to learn the nominal manifold.\n",
        "\n",
        "```\n",
        "                    BENIGN TRAFFIC\n",
        "                          ↓\n",
        "                     Autoencoder\n",
        "                          ↓\n",
        "                  Learn normal behavior\n",
        "                          ↓\n",
        "             ┌────────────┴────────────┐\n",
        "             ↓                         ↓\n",
        "       Low reconstruction       High reconstruction\n",
        "             error                     error\n",
        "             ↓                         ↓\n",
        "          NORMAL                   ANOMALY\n",
        "```\n",
        "\n",
        "**Output Schema:**\n",
        "```json\n",
        "{\n",
        "  \"anomaly_score\": 0.94,\n",
        "  \"status\": \"ANOMALOUS\"\n",
        "}\n",
        "```"
      ]
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": [
        "### 1. Install Dependencies & Import Libraries"
      ]
    },
    {
      "cell_type": "code",
      "execution_count": None,
      "metadata": {},
      "outputs": [],
      "source": [
        "!pip install kagglehub scikit-learn pandas numpy joblib matplotlib seaborn -q\n",
        "\n",
        "import os\n",
        "import glob\n",
        "import json\n",
        "import numpy as np\n",
        "import pandas as pd\n",
        "import joblib\n",
        "import kagglehub\n",
        "import matplotlib.pyplot as plt\n",
        "import seaborn as sns\n",
        "\n",
        "from sklearn.preprocessing import LabelEncoder, StandardScaler\n",
        "from sklearn.neural_network import MLPRegressor\n",
        "from sklearn.metrics import classification_report, roc_auc_score, precision_recall_curve\n",
        "\n",
        "print('Libraries loaded successfully!')"
      ]
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": [
        "### 2. Download Dataset via KaggleHub & Load CSVs"
      ]
    },
    {
      "cell_type": "code",
      "execution_count": None,
      "metadata": {},
      "outputs": [],
      "source": [
        "print('Downloading official UNSW-NB15 dataset via KaggleHub...')\n",
        "dataset_path = kagglehub.dataset_download('mrwellsdavid/unsw-nb15')\n",
        "\n",
        "all_files = os.listdir(dataset_path)\n",
        "print('Files in dataset:', all_files)\n",
        "\n",
        "train_file = next(os.path.join(dataset_path, f) for f in all_files if 'training' in f.lower() or 'train' in f.lower())\n",
        "test_file = next(os.path.join(dataset_path, f) for f in all_files if 'testing' in f.lower() or 'test' in f.lower())\n",
        "\n",
        "df_train = pd.read_csv(train_file)\n",
        "df_test = pd.read_csv(test_file)\n",
        "\n",
        "print(f'\\nTrain Shape: {df_train.shape} | Test Shape: {df_test.shape}')\n",
        "df_train.head(2)"
      ]
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": [
        "### 3. Feature Preprocessing & Skew Normalization"
      ]
    },
    {
      "cell_type": "code",
      "execution_count": None,
      "metadata": {},
      "outputs": [],
      "source": [
        "for df in [df_train, df_test]:\n",
        "    if 'id' in df.columns:\n",
        "        df.drop(columns=['id'], inplace=True)\n",
        "    if 'attack_cat' in df.columns:\n",
        "        df['attack_cat'] = df['attack_cat'].fillna('Normal').astype(str).str.strip()\n",
        "\n",
        "drop_cols = ['label', 'attack_cat']\n",
        "feature_cols = [c for c in df_train.columns if c not in drop_cols]\n",
        "\n",
        "X_train_full = df_train[feature_cols].copy()\n",
        "y_train_label = df_train['label'].copy()\n",
        "\n",
        "X_test_full = df_test[feature_cols].copy()\n",
        "y_test_label = df_test['label'].copy()\n",
        "y_test_cat = df_test['attack_cat'].copy()\n",
        "\n",
        "# Encode categorical features\n",
        "cat_cols = X_train_full.select_dtypes(include=['object', 'category']).columns.tolist()\n",
        "encoders = {}\n",
        "for col in cat_cols:\n",
        "    le = LabelEncoder()\n",
        "    combined = pd.concat([X_train_full[col].astype(str), X_test_full[col].astype(str)], axis=0)\n",
        "    le.fit(combined)\n",
        "    X_train_full[col] = le.transform(X_train_full[col].astype(str))\n",
        "    X_test_full[col] = le.transform(X_test_full[col].astype(str))\n",
        "    encoders[col] = le\n",
        "\n",
        "# Log1p transform on skewed traffic metrics\n",
        "skewed_cols = ['dur', 'sbytes', 'dbytes', 'rate', 'sload', 'dload', 'sinpkt', 'dinpkt', 'sjit', 'djit', 'stcpb', 'dtcpb']\n",
        "for col in skewed_cols:\n",
        "    if col in X_train_full.columns:\n",
        "        X_train_full[col] = np.log1p(np.maximum(0, X_train_full[col].astype(np.float32)))\n",
        "        X_test_full[col] = np.log1p(np.maximum(0, X_test_full[col].astype(np.float32)))\n",
        "\n",
        "X_train_full = X_train_full.astype(np.float32).replace([np.inf, -np.inf], np.nan).fillna(0)\n",
        "X_test_full = X_test_full.astype(np.float32).replace([np.inf, -np.inf], np.nan).fillna(0)\n",
        "\n",
        "print(f'[OK] Features extracted: {len(feature_cols)}')\n",
        "print(f'Normal (Benign) rows: {sum(y_train_label == 0)} | Attack rows: {sum(y_train_label == 1)}')"
      ]
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": [
        "### 4. Isolate Pure BENIGN Network Traffic & Fit StandardScaler\n",
        "We train the model solely on normal traffic (`label == 0`)."
      ]
    },
    {
      "cell_type": "code",
      "execution_count": None,
      "metadata": {},
      "outputs": [],
      "source": [
        "benign_mask = (y_train_label == 0)\n",
        "X_train_benign = X_train_full[benign_mask].copy()\n",
        "\n",
        "print(f'Training Autoencoder on {X_train_benign.shape[0]} pure BENIGN flows...')\n",
        "scaler = StandardScaler()\n",
        "X_train_benign_scaled = scaler.fit_transform(X_train_benign)\n",
        "X_test_scaled = scaler.transform(X_test_full)\n",
        "print('Scaler fit exclusively on Benign traffic.')"
      ]
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": [
        "### 5. Train Bottleneck Autoencoder Architecture\n",
        "Compresses benign flows into a compact latent bottleneck (12 features) and reconstructs them."
      ]
    },
    {
      "cell_type": "code",
      "execution_count": None,
      "metadata": {},
      "outputs": [],
      "source": [
        "input_dim = len(feature_cols)\n",
        "print(f'Fitting Bottleneck Autoencoder (Layers: {input_dim} -> 48 -> 24 -> 12 -> 24 -> 48 -> {input_dim})...')\n",
        "\n",
        "autoencoder = MLPRegressor(\n",
        "    hidden_layer_sizes=(48, 24, 12, 24, 48),\n",
        "    activation='relu',\n",
        "    solver='adam',\n",
        "    alpha=1e-4,\n",
        "    batch_size=256,\n",
        "    learning_rate_init=0.003,\n",
        "    max_iter=30,\n",
        "    random_state=42,\n",
        "    verbose=True,\n",
        "    early_stopping=True,\n",
        "    validation_fraction=0.1\n",
        ")\n",
        "\n",
        "# Autoencoder learns identity mapping of benign manifold\n",
        "autoencoder.fit(X_train_benign_scaled, X_train_benign_scaled)\n",
        "print('Autoencoder training complete!')"
      ]
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": [
        "### 6. Calibrate Anomaly Threshold & Evaluate on Unseen Attack Traffic"
      ]
    },
    {
      "cell_type": "code",
      "execution_count": None,
      "metadata": {},
      "outputs": [],
      "source": [
        "# Calculate benign reconstruction errors\n",
        "benign_recon = autoencoder.predict(X_train_benign_scaled)\n",
        "benign_errors = np.mean((X_train_benign_scaled - benign_recon) ** 2, axis=1)\n",
        "\n",
        "threshold = float(np.percentile(benign_errors, 97.5))\n",
        "max_benign_err = float(np.percentile(benign_errors, 99.5))\n",
        "print(f'Benign Mean MSE: {benign_errors.mean():.6f} | Calibrated 97.5% Anomaly Threshold: {threshold:.6f}')\n",
        "\n",
        "# Evaluate on full test set (Benign + Anomalies)\n",
        "test_recon = autoencoder.predict(X_test_scaled)\n",
        "test_errors = np.mean((X_test_scaled - test_recon) ** 2, axis=1)\n",
        "y_pred_anomaly = (test_errors > threshold).astype(int)\n",
        "auc = roc_auc_score(y_test_label, test_errors)\n",
        "\n",
        "print(f'\\n[ROC-AUC Score]: {auc:.4f}')\n",
        "print('\\nClassification Report (0 = Normal, 1 = Anomaly):')\n",
        "print(classification_report(y_test_label, y_pred_anomaly, target_names=['Normal', 'Anomaly']))\n",
        "\n",
        "eval_df = pd.DataFrame({'attack_cat': y_test_cat, 'error': test_errors, 'flagged': y_pred_anomaly})\n",
        "print('\\nAnomaly Detection Rate Across Attack Families:')\n",
        "print(eval_df.groupby('attack_cat')['flagged'].mean().mul(100).round(1).astype(str) + '%')"
      ]
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": [
        "### 7. Realtime Anomaly Scoring Function & CyberGuard Output Verification"
      ]
    },
    {
      "cell_type": "code",
      "execution_count": None,
      "metadata": {},
      "outputs": [],
      "source": [
        "def detect_flow_anomaly(flow_dict):\n",
        "    row = {}\n",
        "    for feat in feature_cols:\n",
        "        val = flow_dict.get(feat, 0)\n",
        "        if feat in encoders:\n",
        "            le = encoders[feat]\n",
        "            val_str = str(val)\n",
        "            val = le.transform([val_str])[0] if val_str in le.classes_ else 0\n",
        "        row[feat] = float(val)\n",
        "    \n",
        "    for col in skewed_cols:\n",
        "        if col in row:\n",
        "            row[col] = np.log1p(max(0.0, float(row[col])))\n",
        "            \n",
        "    df_in = pd.DataFrame([row])[feature_cols].astype(np.float32)\n",
        "    scaled_in = scaler.transform(df_in)\n",
        "    recon = autoencoder.predict(scaled_in)\n",
        "    recon_error = float(np.mean((scaled_in - recon) ** 2))\n",
        "    \n",
        "    if recon_error <= threshold:\n",
        "        norm_score = (recon_error / threshold) * 0.5\n",
        "    else:\n",
        "        norm_score = 0.5 + min(0.5, ((recon_error - threshold) / (max_benign_err * 2.0)) * 0.5)\n",
        "        \n",
        "    score = round(float(np.clip(norm_score, 0.01, 0.99)), 2)\n",
        "    status = 'ANOMALOUS' if recon_error > threshold else 'NORMAL'\n",
        "    \n",
        "    return {\n",
        "        'anomaly_score': score,\n",
        "        'reconstruction_error': round(recon_error, 6),\n",
        "        'threshold': round(threshold, 6),\n",
        "        'status': status,\n",
        "        'explanation': 'High reconstruction error detected; deviation from learned benign baseline.' if status == 'ANOMALOUS' else 'Low reconstruction error; conforms to benign baseline manifold.'\n",
        "    }\n",
        "\n",
        "# Test 1: Attack Sample (Exploit)\n",
        "attack_sample = df_test[df_test['attack_cat'] == 'Exploits'].iloc[0].to_dict()\n",
        "print('=== TEST 1: Attack Flow ===')\n",
        "print(json.dumps(detect_flow_anomaly(attack_sample), indent=2))\n",
        "\n",
        "# Test 2: Normal Flow\n",
        "normal_sample = df_test[df_test['attack_cat'] == 'Normal'].iloc[0].to_dict()\n",
        "print('\\n=== TEST 2: Normal Benign Flow ===')\n",
        "print(json.dumps(detect_flow_anomaly(normal_sample), indent=2))"
      ]
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": [
        "### 8. Export Model Artifacts (.joblib)"
      ]
    },
    {
      "cell_type": "code",
      "execution_count": None,
      "metadata": {},
      "outputs": [],
      "source": [
        "os.makedirs('artifacts', exist_ok=True)\n",
        "ae_path = os.path.join('artifacts', 'autoencoder_unsw_nb15.joblib')\n",
        "meta_path = os.path.join('artifacts', 'autoencoder_metadata.joblib')\n",
        "\n",
        "payload = {\n",
        "    'threshold': threshold,\n",
        "    'max_benign_err': max_benign_err,\n",
        "    'scaler': scaler,\n",
        "    'features': feature_cols,\n",
        "    'encoders': encoders,\n",
        "    'input_dim': input_dim\n",
        "}\n",
        "\n",
        "joblib.dump(autoencoder, ae_path)\n",
        "joblib.dump(payload, meta_path)\n",
        "\n",
        "print(f'[OK] Autoencoder model saved to: {ae_path}')\n",
        "print(f'[OK] Metadata saved to: {meta_path}')\n",
        "\n",
        "try:\n",
        "    from google.colab import files\n",
        "    files.download(ae_path)\n",
        "    files.download(meta_path)\n",
        "except Exception:\n",
        "    pass"
      ]
    }
  ],
  "metadata": {
    "language_info": {
      "name": "python"
    }
  },
  "nbformat": 4,
  "nbformat_minor": 2
}

with open('UNSW_NB15_Autoencoder_Anomaly_Training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(notebook_content, f, indent=2)

print('Generated UNSW_NB15_Autoencoder_Anomaly_Training.ipynb successfully')
