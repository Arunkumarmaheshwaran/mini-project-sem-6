import os
import time
import joblib
import numpy as np

from app.config import settings
from app.models_db import get_latest_dataset

MODELS_DIR = os.path.join(settings.DATA_DIR, "models")

_loaded_models = {}
_metrics = {"last_predict_time": None}

def _load_models():
    global _loaded_models

    if _loaded_models:
        return _loaded_models

    models = {}
    model_files = {
        "logistic": "logistic.joblib",
        "svm": "svm.joblib",
        "rf": "random_forest.joblib",  
        "dt": "decision_tree.joblib",
        "nb": "naive_bayes.joblib",
        "xgb": "xgboost.joblib"
    }

    for key, filename in model_files.items():
        path = os.path.join(MODELS_DIR, filename)

        if os.path.exists(path):
            models[key] = joblib.load(path)
            print(f"Loaded model: {filename}")
        else:
            print(f" Model not found: {filename}")

    le_path = os.path.join(MODELS_DIR, "label_encoder.joblib")

    if os.path.exists(le_path):
        models["label_encoder"] = joblib.load(le_path)
        print("Loaded label encoder")
    else:
        print(" Label encoder not found!")

    _loaded_models = models
    return models

def predict_crop(data):

    models = _load_models()
    if "label_encoder" not in models:
        raise RuntimeError("Models not trained. Run train_models first.")

    X_arr = np.array(data).reshape(1, -1)

    if "rf" in models:
        model = models["rf"]
    else:
        model = next(v for k, v in models.items() if k != "label_encoder")

    pred = model.predict(X_arr)[0]
    crop = models["label_encoder"].inverse_transform([pred])[0]

    print("Predicted Crop:", crop)  # DEBUG

    return crop

def predict_recommendations(row: dict):
    models = _load_models()

    if "label_encoder" not in models:
        raise RuntimeError("Models not trained. Run train_models first.")

    features = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]

    X = [row.get(f, 0) for f in features]
    X_arr = np.array(X).reshape(1, -1)

    results = {}

    for name, model in models.items():
        if name == "label_encoder":
            continue

        try:
            proba = model.predict_proba(X_arr)[0]
            top_idx = proba.argmax()

            crop = models["label_encoder"].inverse_transform([top_idx])[0]

            results[name] = {
                "recommended": crop,
                "confidence": float(proba[top_idx])
            }

        except Exception:
            pred = model.predict(X_arr)[0]
            crop = models["label_encoder"].inverse_transform([pred])[0]

            results[name] = {
                "recommended": crop,
                "confidence": None
            }

    _metrics["last_predict_time"] = time.time()

    return results
def batch_predict_latest(limit: int = 5):
    rows = get_latest_dataset(limit)
    return [predict_recommendations(r) for r in rows]
def get_metrics():
    return _metrics
