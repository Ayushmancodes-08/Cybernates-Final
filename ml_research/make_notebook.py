import json

notebook = {
    "cells": [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# 🛡️ UNSW-NB15 Intrusion Detection System with XGBoost (Google Drive)\n",
                "This notebook mounts your **Google Drive (`Dataset1` folder)**, loads the UNSW-NB15 dataset, trains an optimized **XGBoost Classifier**, evaluates metrics (F1-score, ROC-AUC, Confusion Matrix), and exports the artifacts."
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
                "!pip install xgboost scikit-learn pandas numpy joblib matplotlib seaborn -q\n",
                "\n",
                "import os\n",
                "import glob\n",
                "import numpy as np\n",
                "import pandas as pd\n",
                "import joblib\n",
                "import matplotlib.pyplot as plt\n",
                "import seaborn as sns\n",
                "\n",
                "from sklearn.preprocessing import LabelEncoder\n",
                "from sklearn.metrics import (\n",
                "    classification_report,\n",
                "    confusion_matrix,\n",
                "    roc_auc_score,\n",
                "    accuracy_score,\n",
                "    f1_score,\n",
                "    precision_score,\n",
                "    recall_score\n",
                ")\n",
                "import xgboost as xgb\n",
                "\n",
                "print('Libraries loaded successfully!')"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "### 2. Mount Google Drive & Load from `Dataset1` Folder"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "from google.colab import drive\n",
                "drive.mount('/content/drive')\n",
                "\n",
                "# Search for Dataset1 folder in Google Drive\n",
                "drive_base = '/content/drive/MyDrive/Dataset1'\n",
                "\n",
                "if not os.path.exists(drive_base):\n",
                "    # Fallback search if placed in nested folder\n",
                "    matches = glob.glob('/content/drive/MyDrive/**/Dataset1', recursive=True)\n",
                "    if matches:\n",
                "        drive_base = matches[0]\n",
                "        print(f'Found Dataset1 at: {drive_base}')\n",
                "    else:\n",
                "        print('Available items in MyDrive:', os.listdir('/content/drive/MyDrive'))\n",
                "        raise FileNotFoundError(f'Could not locate Dataset1 folder at {drive_base}')\n",
                "\n",
                "files_in_folder = os.listdir(drive_base)\n",
                "print('Files inside Dataset1 folder:', files_in_folder)\n",
                "\n",
                "# Identify Train and Test CSV files\n",
                "train_file = next((f for f in files_in_folder if 'train' in f.lower() and f.endswith('.csv')), None)\n",
                "test_file = next((f for f in files_in_folder if 'test' in f.lower() and f.endswith('.csv')), None)\n",
                "\n",
                "if not train_file or not test_file:\n",
                "    # If names are simple or different, take first two CSVs\n",
                "    csv_files = [f for f in files_in_folder if f.endswith('.csv')]\n",
                "    if len(csv_files) >= 2:\n",
                "        train_file, test_file = csv_files[0], csv_files[1]\n",
                "    else:\n",
                "        raise ValueError(f'Expected at least 2 CSV files in {drive_base}, found: {csv_files}')\n",
                "\n",
                "train_path = os.path.join(drive_base, train_file)\n",
                "test_path = os.path.join(drive_base, test_file)\n",
                "\n",
                "print(f'Loading Train: {train_path}')\n",
                "print(f'Loading Test:  {test_path}')\n",
                "\n",
                "df_train = pd.read_csv(train_path)\n",
                "df_test = pd.read_csv(test_path)\n",
                "\n",
                "print(f'Train shape: {df_train.shape} | Test shape: {df_test.shape}')\n",
                "df_train.head(3)"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "### 3. Preprocessing & Feature Encoding"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Drop identifier column\n",
                "for df in [df_train, df_test]:\n",
                "    if 'id' in df.columns:\n",
                "        df.drop(columns=['id'], inplace=True)\n",
                "\n",
                "target_col = 'label'  # 0 = Normal, 1 = Attack\n",
                "drop_cols = ['label', 'attack_cat']\n",
                "\n",
                "X_train = df_train.drop(columns=[c for c in drop_cols if c in df_train.columns])\n",
                "y_train = df_train[target_col]\n",
                "\n",
                "X_test = df_test.drop(columns=[c for c in drop_cols if c in df_test.columns])\n",
                "y_test = df_test[target_col]\n",
                "\n",
                "# Label Encode categorical columns (proto, service, state)\n",
                "cat_cols = X_train.select_dtypes(include=['object']).columns.tolist()\n",
                "encoders = {}\n",
                "for col in cat_cols:\n",
                "    le = LabelEncoder()\n",
                "    combined = pd.concat([X_train[col].astype(str), X_test[col].astype(str)], axis=0)\n",
                "    le.fit(combined)\n",
                "    X_train[col] = le.transform(X_train[col].astype(str))\n",
                "    X_test[col] = le.transform(X_test[col].astype(str))\n",
                "    encoders[col] = le\n",
                "\n",
                "# Clean inf/nan\n",
                "X_train = X_train.replace([np.inf, -np.inf], np.nan).fillna(0)\n",
                "X_test = X_test.replace([np.inf, -np.inf], np.nan).fillna(0)\n",
                "\n",
                "feature_names = X_train.columns.tolist()\n",
                "print(f'Preprocessing complete! Extracted {len(feature_names)} features.')\n",
                "print(f'Categorical columns encoded: {cat_cols}')"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "### 4. Train XGBoost Classifier"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Account for class imbalance\n",
                "scale_pos_weight = (len(y_train) - sum(y_train)) / sum(y_train)\n",
                "\n",
                "model = xgb.XGBClassifier(\n",
                "    n_estimators=300,\n",
                "    max_depth=6,\n",
                "    learning_rate=0.05,\n",
                "    subsample=0.8,\n",
                "    colsample_bytree=0.8,\n",
                "    scale_pos_weight=scale_pos_weight,\n",
                "    objective='binary:logistic',\n",
                "    eval_metric=['logloss', 'auc'],\n",
                "    random_state=42,\n",
                "    tree_method='hist'\n",
                ")\n",
                "\n",
                "print('Training XGBoost on UNSW-NB15...')\n",
                "model.fit(\n",
                "    X_train,\n",
                "    y_train,\n",
                "    eval_set=[(X_train, y_train), (X_test, y_test)],\n",
                "    verbose=50\n",
                ")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "### 5. Evaluate Model Performance"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "y_pred = model.predict(X_test)\n",
                "y_proba = model.predict_proba(X_test)[:, 1]\n",
                "\n",
                "print('================ EVALUATION METRICS ================')\n",
                "print(f'Accuracy:  {accuracy_score(y_test, y_pred) * 100:.2f}%')\n",
                "print(f'Precision: {precision_score(y_test, y_pred) * 100:.2f}%')\n",
                "print(f'Recall:    {recall_score(y_test, y_pred) * 100:.2f}%')\n",
                "print(f'F1-Score:  {f1_score(y_test, y_pred) * 100:.2f}%')\n",
                "print(f'ROC AUC:   {roc_auc_score(y_test, y_proba):.4f}')\n",
                "\n",
                "print('\\nClassification Report:\\n', classification_report(y_test, y_pred, digits=4))\n",
                "\n",
                "# Confusion Matrix & Feature Importance Plots\n",
                "fig, axes = plt.subplots(1, 2, figsize=(16, 6))\n",
                "\n",
                "cm = confusion_matrix(y_test, y_pred)\n",
                "sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False, ax=axes[0],\n",
                "            xticklabels=['Normal', 'Attack'], yticklabels=['Normal', 'Attack'])\n",
                "axes[0].set_title('Confusion Matrix')\n",
                "axes[0].set_xlabel('Predicted')\n",
                "axes[0].set_ylabel('Actual')\n",
                "\n",
                "xgb.plot_importance(model, max_num_features=12, height=0.6, ax=axes[1], title='Top 12 Features')\n",
                "plt.tight_layout()\n",
                "plt.show()"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "### 6. Save Artifacts directly to Google Drive & Trigger Download"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "os.makedirs('artifacts', exist_ok=True)\n",
                "\n",
                "# Save in local runtime\n",
                "joblib.dump(model, 'artifacts/xgboost_unsw_nb15.joblib')\n",
                "joblib.dump(encoders, 'artifacts/label_encoders.joblib')\n",
                "joblib.dump(feature_names, 'artifacts/feature_names.joblib')\n",
                "\n",
                "# Also save a copy directly into your Google Drive Dataset1 folder so you never lose it!\n",
                "joblib.dump(model, os.path.join(drive_base, 'xgboost_unsw_nb15.joblib'))\n",
                "joblib.dump(encoders, os.path.join(drive_base, 'label_encoders.joblib'))\n",
                "joblib.dump(feature_names, os.path.join(drive_base, 'feature_names.joblib'))\n",
                "\n",
                "print(f'[SUCCESS] Artifacts saved to Google Drive: {drive_base}')\n",
                "\n",
                "# Trigger browser download\n",
                "try:\n",
                "    from google.colab import files\n",
                "    print('Triggering browser download of artifacts...')\n",
                "    files.download('artifacts/xgboost_unsw_nb15.joblib')\n",
                "    files.download('artifacts/label_encoders.joblib')\n",
                "    files.download('artifacts/feature_names.joblib')\n",
                "except Exception as e:\n",
                "    print('Artifacts are ready inside your Drive folder.')"
            ]
        }
    ],
    "metadata": {
        "language_info": {
            "name": "python"
        }
    },
    "nbformat": 4,
    "nbformat_minor": 4
}

with open(r"c:\Users\bishn\Downloads\Cybernates\Cybernates\UNSW_NB15_XGBoost_Training.ipynb", "w", encoding="utf-8") as f:
    json.dump(notebook, f, indent=2)

print("Notebook updated to use Google Drive Dataset1 folder!")
