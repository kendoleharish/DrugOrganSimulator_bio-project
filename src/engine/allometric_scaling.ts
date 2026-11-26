import type { PatientPhenotype, Species } from './types';

export function getPhysiologicalParameters(species: Species, phenotype: PatientPhenotype) {
  if (species === 'rodent') {
    const clearanceScale = (0.025 / 70) ** 0.75;
    return { bodyWeightKg: 0.025, hepaticMetabolicFactor: clearanceScale, renalFiltrationFactor: clearanceScale };
  }

  return {
    bodyWeightKg: 70,
    hepaticMetabolicFactor: phenotype === 'poor_cyp_metabolizer' ? 0.35 : phenotype === 'elderly' ? 0.7 : 1,
    renalFiltrationFactor: phenotype === 'renal_impaired' ? 0.25 : phenotype === 'elderly' ? 0.6 : 1
  };
}
