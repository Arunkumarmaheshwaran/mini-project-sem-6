import os
import numpy as np
import pickle

class ManualTree:
    def __init__(self, max_depth=3):
        self.max_depth = max_depth
        self.tree = None

    def fit(self, X, y):
        self.tree = self._build_tree(X, y, depth=0)

    def _build_tree(self, X, y, depth):
        num_samples, num_features = X.shape
        if depth >= self.max_depth or num_samples <= 1:
            return np.mean(y)

        best_feat, best_thresh = None, None
        best_mse = float('inf')
        
        for feat in range(num_features):
            thresholds = np.unique(X[:, feat])
            for thresh in thresholds:
                left_idx = X[:, feat] <= thresh
                if not np.any(left_idx) or np.all(left_idx): continue
                
                mse = np.var(y[left_idx]) * sum(left_idx) + np.var(y[~left_idx]) * sum(~left_idx)
                if mse < best_mse:
                    best_mse, best_feat, best_thresh = mse, feat, thresh

        if best_feat is None: return np.mean(y)
        left_idx = X[:, best_feat] <= best_thresh
        return {
            "feat": best_feat, "thresh": best_thresh,
            "left": self._build_tree(X[left_idx], y[left_idx], depth + 1),
            "right": self._build_tree(X[~left_idx], y[~left_idx], depth + 1)
        }

    def predict_one(self, x, tree):
        if not isinstance(tree, dict): return tree
        if x[tree["feat"]] <= tree["thresh"]:
            return self.predict_one(x, tree["left"])
        return self.predict_one(x, tree["right"])

class ManualXGBoost:
    def __init__(self, n_estimators=10, learning_rate=0.1, max_depth=3):
        self.n_estimators = n_estimators
        self.lr = learning_rate
        self.max_depth = max_depth
        self.trees = []
        self.base_pred = None

    def fit(self, X, y):
        self.base_pred = np.mean(y, axis=0)
        curr_preds = np.full(y.shape, self.base_pred)

        for i in range(self.n_estimators):
            residuals = y - curr_preds
            
            tree = ManualTree(max_depth=self.max_depth)
            tree.fit(X, residuals)
            
            update = np.array([tree.predict_one(x, tree.tree) for x in X])
            curr_preds += self.lr * update
            self.trees.append(tree)
            print(f"Tree {i+1} added.")

    def predict(self, X):
        preds = np.full((X.shape[0],), self.base_pred)
        for tree in self.trees:
            update = np.array([tree.predict_one(x, tree.tree) for x in X])
            preds += self.lr * update
        return preds
def train_and_save_manual():
    model = ManualXGBoost(n_estimators=5, max_depth=3)
    with open("manual_xgboost.pkl", "wb") as f:
        pickle.dump(model, f)
    print("Manual XGBoost logic saved.")

if __name__ == "__main__":
    train_and_save_manual()
