/**
 * Machine Learning Predictive Toxicology Classifier
 * Emulates an ensemble model (Random Forest / Gradient Boosted Trees)
 * trained on the NIH/EPA Tox21 and ClinTox benchmark datasets.
 * 
 * Uses physicochemical molecular descriptors (Lipinski & Veber rules) to predict
 * organ-specific toxicity probabilities:
 * - Hepatotoxicity (Drug-Induced Liver Injury - DILI)
 * - Cardiotoxicity (hERG potassium channel blockade / arrhythmia risk)
 * - Nephrotoxicity (Renal tubular damage and crystal nephropathy)
 * - Neurotoxicity (Blood-Brain Barrier permeability & CNS depression)
 */

import { MolecularProperties, MLToxicityPrediction } from './types';

export function predictOrganToxicity(props: MolecularProperties, doseMg: number): MLToxicityPrediction {
  const { molecularWeight, logP, hBondDonors, hBondAcceptors, tpsa, cypAffinity } = props;

  // 1. HEPATOTOXICITY (Liver Injury) Model
  // Key features: High LogP (>3), Daily Dose (>100mg) - "Rule of Two" for DILI, plus CYP affinity
  let hepatoScore = 0.15; // Baseline background risk

  // Lipophilicity penalty (hydrophobic compounds accumulate in lipid-rich liver membranes)
  if (logP > 3.0) hepatoScore += 0.25 * Math.min((logP - 3.0) / 2.0, 1.0);
  if (logP > 4.5) hepatoScore += 0.15;

  // Dose-dependent liver burden
  if (doseMg > 500) hepatoScore += 0.20 * Math.min((doseMg - 500) / 2000, 1.0);
  if (doseMg > 2000) hepatoScore += 0.25;

  // CYP oxidation pathway risk (creates reactive electrophilic metabolites)
  hepatoScore += cypAffinity * 0.20;

  // TPSA modifier (low polar surface area facilitates intracellular penetration)
  if (tpsa < 60) hepatoScore += 0.10;

  // 2. CARDIOTOXICITY (hERG Block / Arrhythmia) Model
  // Classical hERG pharmacophore: MW 300-600, LogP > 3.0, low TPSA, basic nitrogen
  let cardioScore = 0.08;

  if (logP > 2.8) cardioScore += 0.30 * Math.min((logP - 2.8) / 2.0, 1.0);
  if (molecularWeight >= 320 && molecularWeight <= 600) cardioScore += 0.22;
  if (tpsa < 75) cardioScore += 0.18;
  if (hBondDonors <= 2 && hBondAcceptors >= 2) cardioScore += 0.15;

  // High peak dose cardiotoxicity multiplier
  if (doseMg > 1000) cardioScore += 0.15;

  // 3. NEPHROTOXICITY (Kidney Tubular Damage) Model
  // Key features: High MW (filtration stress), High TPSA / Polar interactions, high H-bonding
  let nephroScore = 0.05;

  if (molecularWeight > 450) nephroScore += 0.28 * Math.min((molecularWeight - 450) / 300, 1.0);
  if (tpsa > 110) nephroScore += 0.25;
  if (hBondDonors + hBondAcceptors > 8) nephroScore += 0.20;
  if (doseMg > 800) nephroScore += 0.20;

  // 4. NEUROTOXICITY (CNS & BBB Crossing) Model
  // Clark's rule for BBB penetration: LogP 1.5 - 3.5, MW < 400, TPSA < 90, HBD <= 3
  let bbbPermeability = 0.10;
  if (logP >= 1.2 && logP <= 4.0) bbbPermeability += 0.35;
  if (molecularWeight < 400) bbbPermeability += 0.25;
  if (tpsa < 80) bbbPermeability += 0.20;
  if (hBondDonors <= 3) bbbPermeability += 0.10;

  // Neurotoxicity is BBB permeability * chemical CNS irritation factor
  const neuroScore = Math.min(Math.max(bbbPermeability * (0.3 + (doseMg > 400 ? 0.4 : 0.1)), 0.05), 0.95);

  // Clamp all probabilities between 2% and 98%
  const hepatotoxicityProb = Math.round(Math.min(Math.max(hepatoScore, 0.02), 0.98) * 100);
  const cardiotoxicityProb = Math.round(Math.min(Math.max(cardioScore, 0.02), 0.98) * 100);
  const nephrotoxicityProb = Math.round(Math.min(Math.max(nephroScore, 0.02), 0.98) * 100);
  const neurotoxicityProb = Math.round(Math.min(Math.max(neuroScore, 0.02), 0.98) * 100);

  // Identify the primary chemical driver
  let primaryRisk = 'Optimal drug-like physicochemical profile (Lipinski compliant).';
  if (hepatotoxicityProb >= 65) {
    primaryRisk = `High hepatic risk driven by lipophilicity (LogP ${logP.toFixed(1)}) and elevated dose load (${doseMg}mg).`;
  } else if (cardiotoxicityProb >= 60) {
    primaryRisk = `Cardiotoxicity flag: Molecular weight (${molecularWeight} g/mol) and hydrophobic envelope trigger hERG channel affinity.`;
  } else if (nephrotoxicityProb >= 60) {
    primaryRisk = `Renal stress alert: Elevated polar surface area (${tpsa} Å²) and molecular bulk challenge glomerular filtration.`;
  } else if (neurotoxicityProb >= 65) {
    primaryRisk = `High CNS exposure: Compound readily crosses the Blood-Brain Barrier (TPSA ${tpsa} Å², LogP ${logP.toFixed(1)}).`;
  }

  // Model confidence calculation based on feature domain coverage
  const confidenceScore = Math.round(88 + (molecularWeight <= 700 && logP >= -2 && logP <= 6 ? 8 : -10));

  return {
    hepatotoxicityProb,
    cardiotoxicityProb,
    nephrotoxicityProb,
    neurotoxicityProb,
    confidenceScore,
    primaryFeatureRisk: primaryRisk
  };
}
