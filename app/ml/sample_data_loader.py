import os
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
MODEL_PATH = os.path.join(os.path.dirname(__file__), "status_model.h5")

def load_cnn_model():
    print("📦 Loading CNN model...")
    model = load_model(MODEL_PATH)
    return model

def predict_image(img_path):
    if not os.path.exists(img_path):
        print("Image not found:", img_path)
        return
    model = load_cnn_model()
    print("Processing image:", img_path)
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    pred = model.predict(img_array)[0]
    label = "Good" if pred[0] > 0.5 else "Bad"

    print("\nPrediction Result:")
    print("Status:", label)
    print("Confidence:", float(pred[0]))
    print("-" * 40)


if __name__ == "__main__":
    test_image_path = "test.jpg"
    predict_image(test_image_path)