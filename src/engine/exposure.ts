import type { SimulationResult } from './types';

/** Trapezoidal AUC over the sampled observation window, in mg*h/L. */
export function exposureAuc(result: SimulationResult): number {
  return result.timeline.slice(1).reduce((total, point, index) => {
    const previous = result.timeline[index];
    return total + (point.timeHours - previous.timeHours) *
      (point.plasmaConcentrationMgL + previous.plasmaConcentrationMgL) / 2;
  }, 0);
}
