import os
import tensorflow as tf

MODEL_PATH = "status_weights.ckpt"
IMG_SIZE = (224, 224)
def init_params():
    initializer = tf.initializers.GlorotUniform()
    # 1280 is the output size of MobileNetV2's pooling layer
    w1 = tf.Variable(initializer([1280, 128]), name="w1")
    b1 = tf.Variable(tf.zeros([128]), name="b1")
    w2 = tf.Variable(initializer([128, 2]), name="w2")
    b2 = tf.Variable(tf.zeros([2]), name="b2")
    return [w1, b1, w2, b2]
def forward_pass(features, params):
    w1, b1, w2, b2 = params
    z1 = tf.matmul(features, w1) + b1
    a1 = tf.nn.relu(z1)
    z2 = tf.matmul(a1, w2) + b2
    return tf.nn.softmax(z2)
base_model = tf.keras.applications.MobileNetV2(include_top=False, weights='imagenet', pooling='avg')

def train_manual(train_dir, epochs=5):
    params = init_params()
    optimizer = tf.optimizers.Adam(0.0001)

    for epoch in range(epochs):
        print(f"Epoch {epoch}")
        for class_idx, label_name in enumerate(["Bad", "Good"]):
            folder = os.path.join(train_dir, label_name)
            for img_name in os.listdir(folder):
                raw = tf.io.read_file(os.path.join(folder, img_name))
                img = tf.image.decode_jpeg(raw, channels=3)
                img = tf.image.resize(img, IMG_SIZE) / 255.0
                img = tf.expand_dims(img, 0)
                features = base_model(img, training=False)

                with tf.GradientTape() as tape:
                    preds = forward_pass(features, params)
                    label = tf.one_hot(class_idx, 2)
                    loss = -tf.reduce_sum(label * tf.math.log(preds + 1e-9))
                grads = tape.gradient(loss, params)
                optimizer.apply_gradients(zip(grads, params))

    checkpoint = tf.train.Checkpoint(w1=params[0], b1=params[1], w2=params[2], b2=params[3])
    checkpoint.save(MODEL_PATH)

def predict_manual(image_path):
    params = init_params()
    checkpoint = tf.train.Checkpoint(w1=params[0], b1=params[1], w2=params[2], b2=params[3])
    checkpoint.restore(tf.train.latest_checkpoint(".")).expect_partial()

    raw = tf.io.read_file(image_path)
    img = tf.image.decode_jpeg(raw, channels=3)
    img = tf.image.resize(img, IMG_SIZE) / 255.0
    
    features = base_model(tf.expand_dims(img, 0))
    preds = forward_pass(features, params).numpy()[0]
    
    label = "Good" if preds[1] > preds[0] else "Bad"
    return label, {"Bad": float(preds[0]), "Good": float(preds[1])}

if __name__ == "__main__":
    pass
