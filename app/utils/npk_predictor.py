import json
import os
import math

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "app", "ml", "models", "npk_model.json")

def get_npk(crop_name, temp, humidity, ph, rainfall):
    if not os.path.exists(MODEL_PATH):
        return {"N": 0, "P": 0, "K": 0}

    with open(MODEL_PATH, "r") as f:
        knowledge = json.load(f)
    crop = str(crop_name).lower().strip()
    if crop not in knowledge:
        return {"N": 0, "P": 0, "K": 0}

    examples = knowledge[crop] 
    scores = []

    for ex in examples:
        diff = math.sqrt(
            (ex["t"] - float(temp))**2 + 
            (ex["h"] - float(humidity))**2 + 
            (ex["ph"] - float(ph))**2 + 
            (ex["r"] - float(rainfall))**2
        )
        scores.append((diff, ex))

    scores.sort(key=lambda x: x[0])
    top_matches = [x[1] for x in scores[:3]]
    
    avg_n = sum(m["n"] for m in top_matches) / len(top_matches)
    avg_p = sum(m["p"] for m in top_matches) / len(top_matches)
    avg_k = sum(m["k"] for m in top_matches) / len(top_matches)

    return {"N": round(avg_n, 2), "P": round(avg_p, 2), "K": round(avg_k, 2)}

