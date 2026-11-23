/**
 * Allometric Scaling Engine (Human vs. Rodent Physiology)
 * Based on Kleiber's Law (B ∝ M^0.75) and Interspecies Pharmacokinetic Scaling
 * Explains why 90% of drugs that pass animal models fail in human clinical trials.
 */

import { Species, PatientPhenotype } from './types';

export interface PhysiologicalParameters {
  bodyWeightKg: number;
  bloodVolumeL: number;
  cardiacOutputLPerMin: number;
  hepaticMetabolicFactor: number; // Multiplier on liver clearance rate
  renalFiltrationFactor: number;   // Multiplier on kidney clearance rate
  bloodBrainBarrierTightness: number; // Resistance factor to BBB crossing
}

export function getPhysiologicalParameters(
  species: Species,
  phenotype: PatientPhenotype = 'healthy_adult'
): PhysiologicalParameters {
  if (species === 'rodent') {
    // 25-gram mouse model (Mus musculus)
    // Kleiber's 3/4 allometric power law: Clearance = Cl_human * (M_mouse / M_human)^0.75
    // Mass ratio = 0.025 / 70 = 0.000357
    // Mass ratio ^ 0.75 = 0.00257
    // Per kg, mouse metabolizes (0.00257 / 0.000357) = 7.2x faster than human!
    const massRatio = 0.025 / 70.0;
    const allometricClScale = Math.pow(massRatio, 0.75); // ~0.00257

    return {
      bodyWeightKg: 0.025,
      bloodVolumeL: 0.002, // 2 mL blood
      cardiacOutputLPerMin: 0.015, // 15 mL/min (~600 bpm)
      hepaticMetabolicFactor: allometricClScale, // Absolute scaled clearance
      renalFiltrationFactor: allometricClScale,
      bloodBrainBarrierTightness: 0.85
    };
  }

  // Human Model (Homo sapiens, ~70kg baseline)
  let hepaticFactor = 1.0;
  let renalFactor = 1.0;
  let bbbTightness = 1.0;

  // Apply genetic polymorphism and pathological phenotypes
  switch (phenotype) {
    case 'poor_cyp_metabolizer':
      // CYP2D6 / CYP2E1 genetic deficiency: Liver clears drug at 35% speed
      hepaticFactor = 0.35;
      break;
    case 'renal_impaired':
      // Reduced GFR (eGFR < 30 mL/min): Kidneys excrete at 25% speed
      renalFactor = 0.25;
      break;
    case 'elderly':
      // Combined age-related decline in liver perfusion (-30%) and GFR (-40%)
      hepaticFactor = 0.70;
      renalFactor = 0.60;
      bbbTightness = 0.75; // Slower/leakier BBB
      break;
    case 'healthy_adult':
    default:
      hepaticFactor = 1.0;
      renalFactor = 1.0;
      bbbTightness = 1.0;
      break;
  }

  return {
    bodyWeightKg: 70.0,
    bloodVolumeL: 5.0,
    cardiacOutputLPerMin: 5.0, // ~70 bpm
    hepaticMetabolicFactor: hepaticFactor,
    renalFiltrationFactor: renalFactor,
    bloodBrainBarrierTightness: bbbTightness
  };
}
