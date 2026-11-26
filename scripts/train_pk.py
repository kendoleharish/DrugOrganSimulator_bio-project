"""Reproduce an educational human half-life baseline from PKSmart records."""
import hashlib
import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.neighbors import KNeighborsRegressor
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data/research/human_pk.csv'
FEATURES = ['MW', 'HBA', 'HBD', 'TPSA_NO']
TARGET = 'human_thalf'
data = pd.read_csv(SOURCE)
valid = data.dropna(subset=FEATURES + [TARGET]).copy()
valid = valid[(valid[TARGET] > 0) & np.isfinite(valid[FEATURES + [TARGET]]).all(axis=1)]
# Identical descriptor vectors stay together. This also keeps repeated structures
# together, though related chemical scaffolds may still cross the partition.
valid['group'] = valid[FEATURES].round(4).astype(str).agg('|'.join, axis=1)
grouped = valid.groupby('group', sort=True).agg({**{f: 'median' for f in FEATURES}, TARGET: 'median'})
test_mask = np.array([int(hashlib.sha256(key.encode()).hexdigest()[:8], 16) % 5 == 0 for key in grouped.index])
train, test = grouped.loc[~test_mask], grouped.loc[test_mask]
scaler = StandardScaler().fit(train[FEATURES])
x_train = scaler.transform(train[FEATURES])
y_train = np.log10(train[TARGET].to_numpy())
# Fixed before evaluation. The held-out set is never used for fitting or tuning.
model = KNeighborsRegressor(n_neighbors=15, weights='uniform').fit(x_train, y_train)
prediction = model.predict(scaler.transform(test[FEATURES]))
truth = np.log10(test[TARGET].to_numpy())
baseline = np.full(len(test), np.median(y_train))
metrics = {
    'log10MAE': float(mean_absolute_error(truth, prediction)),
    'log10RMSE': float(np.sqrt(mean_squared_error(truth, prediction))),
    'medianFoldError': float(np.median(10 ** np.abs(truth - prediction))),
    'baselineLog10MAE': float(mean_absolute_error(truth, baseline)),
}
artifact = {
    'version': 'human-half-life-knn-v1',
    'target': 'Human intravenous terminal half-life',
    'unit': 'h', 'features': FEATURES, 'neighbors': 15,
    'mean': scaler.mean_.tolist(), 'scale': scaler.scale_.tolist(),
    'minimum': train[FEATURES].min().tolist(), 'maximum': train[FEATURES].max().tolist(),
    'trainingFeatures': x_train.tolist(), 'trainingLogTargets': y_train.tolist(),
    'trainingCount': len(train), 'testCount': len(test),
    'sourceRows': len(data), 'usableRows': len(valid),
    'sourceSHA256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
    'source': 'https://github.com/srijitseal/PKSmart',
    'metrics': metrics,
    'limitations': [
        'Human intravenous records only. Mouse and oral outcomes are outside evaluation.',
        'Descriptor-group holdout does not establish generalization to new chemical scaffolds.',
        'TPSA and hydrogen-bond descriptors may differ across calculation systems.',
        'Neighbor spread is descriptive and is not a calibrated confidence interval.',
        'No organ injury or tissue concentration target was trained.',
    ],
}
(ROOT / 'public/research/half-life-model.json').write_text(json.dumps(artifact, allow_nan=False), encoding='utf-8')
report = {key: value for key, value in artifact.items() if key not in ['trainingFeatures', 'trainingLogTargets']}
(ROOT / 'data/research/evaluation.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))
