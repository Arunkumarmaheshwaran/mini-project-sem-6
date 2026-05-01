import csv
import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "crop_recommendation.csv")
MODEL_PATH = os.path.join(BASE_DIR, "app", "ml", "models", "npk_model.json")

def train_manual_model():
    model_data = {}

    with open(DATA_PATH, "r") as file:
        reader = csv.DictReader(file)
        for row in reader:
            crop = row["label"].strip().lower()
            
            if crop not in model_data:
                model_data[crop] = []
            
            model_data[crop].append({
                "n": float(row["N"]),
                "p": float(row["P"]),
                "k": float(row["K"]),
                "t": float(row["temperature"]),
                "h": float(row["humidity"]),
                "ph": float(row["ph"]),
                "r": float(row["rainfall"])
            })

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, "w") as f:
        json.dump(model_data, f, indent=4)
    print(" Model updated to list format!")

if __name__ == "__main__":
    train_manual_model()