/**
 * InSilico-3D Pharmacokinetic & Toxicity Engine Types
 * Grounded in Quantitative Systems Pharmacology (QSP) and Physiological ADME
 */

export type AdministrationRoute = 'oral' | 'iv';

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
  oralBioavailability?: number;
  absorptionRateKa: number; // hr^-1
  volumeOfDistributionVd: number; // L/kg
  baseHepaticClearance: number; // L/hr
  baseRenalClearance: number;   // L/hr
  halfLifeHours: number;        // t1/2
  toxicMetaboliteName?: string; // e.g. "NAPQI"
  clinicalSideEffects: string[];
}

export interface SimulationTimeStep {
  timeHours: number;
  gutAmountMg: number;
  plasmaConcentrationMgL: number;
  centralAmountMg: number;
  hepaticEliminatedMg: number;
  renalEliminatedMg: number;
  presystemicLossMg: number;
  administeredMg: number;
  gshDemandUmol?: number;
  napqiFormationRateUmolH?: number;
}

export interface SimulationResult {
  drug: DrugProfile;
  species: Species;
  phenotype: PatientPhenotype;
  route: AdministrationRoute;
  dosageMg: number;
  administeredDoseMg: number;
  dosingIntervalHours: number;
  totalDurationHours: number;
  cMax: number;
  tMax: number;
  doseCount: number;
  steadyStateReached: boolean;
  steadyStateHour: number | null;
  timeline: SimulationTimeStep[];
}