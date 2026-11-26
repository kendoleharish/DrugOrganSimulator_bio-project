export interface HalfLifeModel {
  version: string;
  neighbors: number;
  mean: number[];
  scale: number[];
  minimum: number[];
  maximum: number[];
  trainingFeatures: number[][];
  trainingLogTargets: number[];
  trainingCount: number;
  testCount: number;
  metrics: { log10MAE: number; baselineLog10MAE: number; medianFoldError: number };
  limitations: string[];
}

export function predictHalfLife(model: HalfLifeModel, features: number[]) {
  if (features.length !== 4 || features.some(value => !Number.isFinite(value) || value < 0)) {
    throw new Error('Four finite, nonnegative molecular descriptors are required.');
  }
  const withinRange = features.every((value, index) => value >= model.minimum[index] && value <= model.maximum[index]);
  const standardized = features.map((value, index) => (value - model.mean[index]) / model.scale[index]);
  const neighbors = model.trainingFeatures.map((row, index) => ({
    index,
    distance: row.reduce((total, value, column) => total + (value - standardized[column]) ** 2, 0),
  })).sort((a, b) => a.distance - b.distance).slice(0, model.neighbors);
  const logEstimate = neighbors.reduce((total, row) => total + model.trainingLogTargets[row.index], 0) / neighbors.length;
  return { hours: 10 ** logEstimate, withinRange, nearestDistance: Math.sqrt(neighbors[0].distance) };
}
