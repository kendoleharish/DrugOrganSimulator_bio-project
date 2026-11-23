/**
 * InSilico-3D Pharmacokinetic & Toxicity Engine Types
 * Grounded in Quantitative Systems Pharmacology (QSP) and Physiological ADME
 */

export type Species = 'human' | 'rodent';

export type PatientPhenotype = 'healthy_adult' | 'poor_cyp_metabolizer' | 'renal_impaired' | 'elderly';

export interface MolecularProperties {
  name: string;
  formula: string;
  molecularWeight: number; // g/mol (MW)
  logP: number;            // Octanol-water partition coefficient (Lipophilicity)
  hBondDonors: number;    // Lipinski HBD
  hBondAcceptors: number; // Lipinski HBA
  tpsa: number;           // Topological Polar Surface Area (Å²)
  cypAffinity: number;    // 0 to 1 affinity for CYP3A4 / CYP2E1 oxidation
}

export interface DrugProfile {
  id: string;
  name: string;
  description: string;
  standardDoseMg: number;
  maxDailySafeDoseMg: number;
  properties: MolecularProperties;
  absorptionRateKa: number; // hr^-1
  volumeOfDistributionVd: number; // L/kg
  baseHepaticClearance: number; // L/hr
  baseRenalClearance: number;   // L/hr
  halfLifeHours: number;        // t1/2
  toxicMetaboliteName?: string; // e.g. "NAPQI"
  clinicalSideEffects: string[];
}

export interface MLToxicityPrediction {
  hepatotoxicityProb: number;  // 0% - 100% (Liver cell necrosis risk)
  cardiotoxicityProb: number;   // 0% - 100% (Arrhythmia / hERG block risk)
  nephrotoxicityProb: number;   // 0% - 100% (Kidney tubular damage risk)
  neurotoxicityProb: number;    // 0% - 100% (CNS depression / BBB penetration)
  confidenceScore: number;      // 0% - 100%
  primaryFeatureRisk: string;   // Explanation of which chemical feature drove the risk
}

export interface OrganState {
  concentration: number;   // mg/L or relative tissue exposure
  stressLevel: number;     // 0 (completely healthy) to 1.0 (severe toxic damage / necrosis)
  colorState: 'healthy' | 'stressed' | 'toxic';
  activeMetaboliteLevel?: number; // e.g. Free NAPQI level
  glutathioneReservePct?: number; // 100% down to 0% (protective buffer in liver)
  filtrationEfficiencyPct?: number; // 100% down to 0% (kidney eGFR)
}

export interface SimulationTimeStep {
  timeHours: number;
  gutAmountMg: number;
  plasmaConcentrationMgL: number;
  organs: {
    stomach: OrganState;
    liver: OrganState;
    heart: OrganState;
    kidneys: OrganState;
    brain: OrganState;
  };
  crossTalkInterference: boolean; // True if one organ failure is worsening another
  systemicAlert?: string;
}

export interface SimulationResult {
  drug: DrugProfile;
  species: Species;
  phenotype: PatientPhenotype;
  dosageMg: number;
  dosingIntervalHours: number; // e.g. 0 for single dose, 8 for Q8H, 24 for daily
  totalDurationHours: number;
  cMax: number;
  tMax: number;
  steadyStateReached: boolean;
  mlPrediction: MLToxicityPrediction;
  timeline: SimulationTimeStep[];
  loopholesMitigated: {
    reactiveMetaboliteDetected: boolean;
    speciesMismatchDemonstrated: boolean;
    crossTalkCascadeTriggered: boolean;
    chronicAccumulationDetected: boolean;
  };
}
