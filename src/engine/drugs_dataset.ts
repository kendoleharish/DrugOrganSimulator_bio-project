/**
 * Curated Clinical Benchmark Drugs Dataset
 * Real pharmacological and physicochemical values from PubChem, DrugBank, and FDA package inserts.
 */

import { DrugProfile } from './types';

export const BENCHMARK_DRUGS: DrugProfile[] = [
  {
    id: 'paracetamol',
    name: 'Paracetamol (Acetaminophen)',
    description: 'Everyday antipyretic & analgesic. Safe at 500mg, but at overdose (>4000mg) depletes liver glutathione, causing toxic NAPQI metabolite accumulation and fatal hepatic necrosis.',
    standardDoseMg: 500,
    maxDailySafeDoseMg: 3000,
    properties: {
      name: 'Acetaminophen',
      formula: 'C8H9NO2',
      molecularWeight: 151.16,
      logP: 0.46,
      hBondDonors: 2,
      hBondAcceptors: 2,
      tpsa: 49.33,
      cypAffinity: 0.75 // Oxidized by CYP2E1 into NAPQI
    },
    absorptionRateKa: 1.5, // Rapid GI absorption
    volumeOfDistributionVd: 0.95, // L/kg
    baseHepaticClearance: 18.0, // L/hr (primarily liver)
    baseRenalClearance: 1.2,    // L/hr (minor urinary)
    halfLifeHours: 2.5,
    toxicMetaboliteName: 'NAPQI (N-acetyl-p-benzoquinone imine)',
    clinicalSideEffects: [
      'Glutathione depletion',
      'Acute centrilobular liver necrosis',
      'Elevated serum ALT / AST enzymes',
      'Nausea & epigastric discomfort'
    ]
  },
  {
    id: 'ibuprofen',
    name: 'Ibuprofen (NSAID)',
    description: 'Non-steroidal anti-inflammatory. Inhibits COX-1/COX-2. At high or chronic doses, strips protective stomach mucus and constricts renal arterioles, causing acute kidney injury.',
    standardDoseMg: 400,
    maxDailySafeDoseMg: 1200,
    properties: {
      name: 'Ibuprofen',
      formula: 'C13H18O2',
      molecularWeight: 206.28,
      logP: 3.5, // High lipophilicity
      hBondDonors: 1,
      hBondAcceptors: 2,
      tpsa: 37.3,
      cypAffinity: 0.45
    },
    absorptionRateKa: 1.1,
    volumeOfDistributionVd: 0.15,
    baseHepaticClearance: 3.5,
    baseRenalClearance: 0.5,
    halfLifeHours: 2.0,
    clinicalSideEffects: [
      'Gastric mucosal ulceration',
      'Renal medullary hypoperfusion',
      'Decreased Glomerular Filtration Rate (eGFR)',
      'Fluid retention & elevated blood pressure'
    ]
  },
  {
    id: 'caffeine',
    name: 'Caffeine',
    description: 'Central Nervous System stimulant. Crosses the Blood-Brain Barrier with near 100% efficiency. Overdosing leads to tachycardia, cardiac dysrhythmias, and severe tremors.',
    standardDoseMg: 100,
    maxDailySafeDoseMg: 400,
    properties: {
      name: 'Caffeine',
      formula: 'C8H10N4O2',
      molecularWeight: 194.19,
      logP: -0.07,
      hBondDonors: 0,
      hBondAcceptors: 6,
      tpsa: 58.44,
      cypAffinity: 0.85 // CYP1A2 substrate
    },
    absorptionRateKa: 2.2, // Very fast
    volumeOfDistributionVd: 0.60,
    baseHepaticClearance: 5.4,
    baseRenalClearance: 0.3,
    halfLifeHours: 5.0,
    clinicalSideEffects: [
      'Sinus tachycardia & heart palpitations',
      'CNS hyper-stimulation & tremors',
      'Gastric acid hyper-secretion',
      'Sleep cycle disruption'
    ]
  },
  {
    id: 'doxorubicin',
    name: 'Doxorubicin (Chemotherapy)',
    description: 'Potent anthracycline antitumor antibiotic. Highly effective against malignancies, but infamous for life-threatening cumulative, irreversible cardiotoxicity.',
    standardDoseMg: 60,
    maxDailySafeDoseMg: 75,
    properties: {
      name: 'Doxorubicin',
      formula: 'C27H29NO11',
      molecularWeight: 543.52,
      logP: 1.27,
      hBondDonors: 6,
      hBondAcceptors: 12,
      tpsa: 206.07, // Bulky, high polar surface area
      cypAffinity: 0.30
    },
    absorptionRateKa: 0.5, // Slow / IV baseline
    volumeOfDistributionVd: 25.0, // High tissue sequestering
    baseHepaticClearance: 30.0,
    baseRenalClearance: 4.5,
    halfLifeHours: 30.0, // Long terminal half-life
    clinicalSideEffects: [
      'Dose-dependent dilated cardiomyopathy',
      'Myocardial free radical accumulation',
      'Bone marrow myelosuppression',
      'Severe nausea & stomatitis'
    ]
  }
];
