import { BENCHMARK_DRUGS } from './drugs_dataset';
import { runPharmacokineticSimulation } from './pharmacokinetics';
import type { SimulationResult } from './types';

// Approximate digitization of the shared descending limb, FDA NDA 21-087, printed page 35.
export const observedPlasma = [
  { timeHours: 3, concentrationMgL: 2.6 },
  { timeHours: 4, concentrationMgL: 1.8 },
  { timeHours: 5, concentrationMgL: 1.4 }
];

export function referenceApplies(result: SimulationResult) {
  return result.drug.id === 'paracetamol' && result.species === 'human'
    && result.phenotype === 'healthy_adult' && result.route === 'oral'
    && result.dosingIntervalHours === 0 && result.dosageMg === 500
    && result.totalDurationHours >= 5;
}

export function validationMetrics(result: SimulationResult) {
  if (!referenceApplies(result)) return null;
  const errors = observedPlasma.map(point => {
    const sample = result.timeline.find(step => Math.abs(step.timeHours - point.timeHours) < 1e-8);
    if (!sample) throw new Error('Missing reference sampling time.');
    return sample.plasmaConcentrationMgL - point.concentrationMgL;
  });
  return {
    maeMgL: errors.reduce((sum, error) => sum + Math.abs(error), 0) / errors.length,
    rmseMgL: Math.sqrt(errors.reduce((sum, error) => sum + error ** 2, 0) / errors.length),
    peakErrorMgL: result.cMax - 7.16
  };
}

export function sensitivity() {
  const baseline = BENCHMARK_DRUGS[0];
  const output = [];
  for (const parameter of ['absorptionRateKa', 'volumeOfDistributionVd', 'baseHepaticClearance', 'oralBioavailability'] as const) {
    for (const multiplier of [0.8, 1.2]) {
      const drug = { ...baseline, [parameter]: baseline[parameter]! * multiplier };
      const result = runPharmacokineticSimulation(drug, 500);
      output.push({ parameter, multiplier, peakMgL: result.cMax, peakHour: result.tMax });
    }
  }
  return output;
}
