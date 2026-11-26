import type { SimulationTimeStep } from './types';

export const DISPOSITION_COLORS = ['#398b83', '#58b8ac', '#a4ebda'] as const;

export function anatomyMetric(key: string, step: SimulationTimeStep) {
  switch (key) {
    case 'stomach':
    case 'small_intestine':
      return { label: 'Shared oral depot', amountMg: step.gutAmountMg, detail: 'Combined gastrointestinal amount. The stomach and intestine share this compartment.' };
    case 'liver':
      return { label: 'Hepatic elimination', amountMg: step.hepaticEliminatedMg, detail: 'Cumulative systemic parent-drug metabolism.' };
    case 'kidney_l':
    case 'kidney_r':
      return { label: 'Renal elimination', amountMg: step.renalEliminatedMg, detail: 'Cumulative parent-drug elimination by both kidneys together.' };
    default:
      return undefined;
  }
}

export function dispositionBand(amountMg: number, administeredMg: number) {
  const share = administeredMg > 0 ? amountMg / administeredMg : 0;
  if (share <= 0) return -1;
  return share < 0.1 ? 0 : share < 0.5 ? 1 : 2;
}
