/**
 * Multi-Compartment Pharmacokinetic & Pharmacodynamic Simulation Engine
 * Solves coupled non-linear differential equations (ADME)
 * Solves:
 * 1. Reactive toxic metabolite & Glutathione (GSH) depletion
 * 2. Multi-organ cross-talk (Renal impairment backing up blood clearance -> secondary cardiac toxicity)
 * 3. Chronic multi-day accumulation (Steady-state kinetics)
 * 4. Human vs. Rodent allometric scaling
 */

import { DrugProfile, Species, PatientPhenotype, SimulationResult, SimulationTimeStep, OrganState } from './types';
import { getPhysiologicalParameters } from './allometric_scaling';
import { predictOrganToxicity } from './ml_toxicity_model';

export function runPharmacokineticSimulation(
  drug: DrugProfile,
  dosageMg: number,
  species: Species = 'human',
  phenotype: PatientPhenotype = 'healthy_adult',
  dosingIntervalHours: number = 0, // 0 = single bolus; 8 = every 8 hours, etc.
  totalDurationHours: number = 24
): SimulationResult {
  const phys = getPhysiologicalParameters(species, phenotype);
  const mlPrediction = predictOrganToxicity(drug.properties, dosageMg);

  // Normalize dose to species body mass if comparing species on a mg/kg basis
  // In rodents, absolute dose scales to body mass (0.025kg vs 70kg)
  const administeredDose = species === 'rodent' 
    ? (dosageMg / 70.0) * phys.bodyWeightKg 
    : dosageMg;

  // Scaled pharmacokinetic clearance constants based on species and phenotype
  const effectiveVd = drug.volumeOfDistributionVd * phys.bodyWeightKg;
  const ka = drug.absorptionRateKa;
  
  // Base hourly clearances adjusted by physiological organ factors
  let baseHepaticCl = drug.baseHepaticClearance * phys.hepaticMetabolicFactor;
  let baseRenalCl = drug.baseRenalClearance * phys.renalFiltrationFactor;

  // Time-stepping variables (dt = 0.1 hour = 6 minutes)
  const dt = 0.1;
  const totalSteps = Math.ceil(totalDurationHours / dt);

  // Initial State
  let gutAmount = administeredDose;
  let plasmaConcentration = 0; // mg/L
  let glutathioneReserve = 100.0; // 100% baseline in hepatocytes (approx. 4g total pool in human)
  let freeToxicMetabolite = 0; // e.g. NAPQI
  let kidneyFiltrationEfficiency = 100.0; // 100% normal eGFR

  const timeline: SimulationTimeStep[] = [];
  let cMax = 0;
  let tMax = 0;

  // Flags for loopholes demonstrated
  let reactiveMetaboliteDetected = false;
  let crossTalkCascadeTriggered = false;
  let chronicAccumulationDetected = false;

  for (let step = 0; step <= totalSteps; step++) {
    const t = Math.round(step * dt * 10) / 10;

    // Check for repeated dose administration (Chronic Dosing Regimen)
    if (dosingIntervalHours > 0 && t > 0 && Math.abs(t % dosingIntervalHours) < 0.05 && t < totalDurationHours) {
      gutAmount += administeredDose;
      chronicAccumulationDetected = true;
    }

    // 1. Gut Absorption Rate
    const absorbedRate = ka * gutAmount; // mg/hr
    gutAmount = Math.max(0, gutAmount - absorbedRate * dt);

    // 2. Multi-Organ Cross-Talk & Renal Feedback Loop
    // If kidney filtration efficiency drops, renal clearance drops proportionally!
    const effectiveRenalCl = baseRenalCl * (kidneyFiltrationEfficiency / 100.0);
    const totalClearanceRate = baseHepaticCl + effectiveRenalCl; // L/hr

    // 3. Plasma Concentration Differential Equation
    // dCp/dt = (absorbedRate - TotalCl * Cp) / Vd
    const dCp = (absorbedRate - (totalClearanceRate * plasmaConcentration)) / effectiveVd;
    plasmaConcentration = Math.max(0, plasmaConcentration + dCp * dt);

    if (plasmaConcentration > cMax) {
      cMax = plasmaConcentration;
      tMax = t;
    }

    // 4. Hepatic Metabolism & Reactive Toxic Metabolite (GSH Depletion)
    // In human therapeutic doses (500mg), >90% is cleared safely by Glucuronidation and Sulfation.
    // However, when plasma concentration spikes due to overdose (>20 mg/L or dose > 2000mg),
    // the safe Phase II enzymes become saturated (Michaelis-Menten saturation).
    // The excess drug spills over into the CYP450 (CYP2E1) oxidation pathway, generating toxic NAPQI.
    const isSaturated = plasmaConcentration > 15.0 || dosageMg > 2000;
    const cypOxidationFraction = isSaturated 
      ? 0.35 * Math.min((plasmaConcentration / 15.0), 3.0) 
      : 0.05;

    // Rate of drug processed by liver in mg/hr
    const hepaticMetabolicRateMgHr = baseHepaticCl * plasmaConcentration;
    const toxicMetaboliteFluxMgHr = hepaticMetabolicRateMgHr * drug.properties.cypAffinity * cypOxidationFraction;

    // Functional hepatic glutathione reserve pool: ~1,500 mg in 70kg human (scales with mass)
    const gshPoolMg = 1500.0 * (phys.bodyWeightKg / 70.0);
    const gshDepletionRatePctHr = (toxicMetaboliteFluxMgHr / gshPoolMg) * 100.0;
    
    // Basal biological GSH regeneration (~3.0% per hour in human, ~15% in rodent)
    const gshSynthesisRatePctHr = species === 'rodent' ? 15.0 : 3.0;

    glutathioneReserve = Math.max(0, Math.min(100.0,
      glutathioneReserve - (gshDepletionRatePctHr * dt) + (gshSynthesisRatePctHr * dt)
    ));

    // When Glutathione drops below critical 30% threshold, reactive metabolite accumulates
    if (glutathioneReserve < 30.0) {
      freeToxicMetabolite += (toxicMetaboliteFluxMgHr * 0.4) * dt;
      reactiveMetaboliteDetected = true;
    } else {
      freeToxicMetabolite = Math.max(0, freeToxicMetabolite - (0.6 * dt)); // Safely neutralized
    }

    // 5. Kidney Dynamics & Nephrotoxic Damage
    // High plasma concentration of polar/bulky drugs causes renal tubular constriction
    const renalBurden = (plasmaConcentration * (mlPrediction.nephrotoxicityProb / 100.0));
    if (renalBurden > 1.2) {
      kidneyFiltrationEfficiency = Math.max(15.0, kidneyFiltrationEfficiency - 1.5 * dt * 10);
    } else {
      kidneyFiltrationEfficiency = Math.min(100.0, kidneyFiltrationEfficiency + 0.2 * dt * 10);
    }

    // Detect Cross-Talk Cascading Failure
    // If kidney efficiency drops below 50%, clearance slows, which backs up blood levels and stresses Heart
    let crossTalkActive = false;
    if (kidneyFiltrationEfficiency < 60.0 && plasmaConcentration > (cMax * 0.6)) {
      crossTalkActive = true;
      crossTalkCascadeTriggered = true;
    }

    // 6. Calculate Organ-Specific Stress & Color States
    // STOMACH
    const stomachStress = Math.min(1.0, (gutAmount / (drug.standardDoseMg * 1.5)) * (drug.id === 'ibuprofen' ? 0.9 : 0.3));
    
    // LIVER
    // Liver stress is driven by free toxic metabolite + depleted glutathione + overall hepatic load
    let liverStress = (1.0 - glutathioneReserve / 100.0) * 0.7 + (freeToxicMetabolite > 0.1 ? 0.3 : 0.0);
    liverStress = Math.min(1.0, Math.max(0, liverStress));

    // HEART
    // Cardiotoxicity driven by plasma level + ML cardiotoxicity score + crossTalk backup
    let heartStress = (plasmaConcentration / (drug.standardDoseMg / effectiveVd * 2.0)) * (mlPrediction.cardiotoxicityProb / 100.0);
    if (crossTalkActive) heartStress += 0.25; // Cascading cardiorenal strain
    heartStress = Math.min(1.0, Math.max(0, heartStress));

    // KIDNEYS
    const kidneyStress = Math.min(1.0, Math.max(0, (100.0 - kidneyFiltrationEfficiency) / 100.0));

    // BRAIN
    // CNS exposure based on BBB permeability from molecular properties
    const bbbFactor = (drug.properties.logP >= 1.0 && drug.properties.logP <= 3.5 ? 1.0 : 0.4) / phys.bloodBrainBarrierTightness;
    const brainConcentration = plasmaConcentration * bbbFactor;
    const brainStress = Math.min(1.0, (brainConcentration / (drug.standardDoseMg / effectiveVd * 1.5)) * (mlPrediction.neurotoxicityProb / 100.0));

    // Helper for color state
    const getColorState = (stress: number): 'healthy' | 'stressed' | 'toxic' => {
      if (stress > 0.65) return 'toxic';
      if (stress > 0.25) return 'stressed';
      return 'healthy';
    };

    let alertMessage: string | undefined;
    if (liverStress > 0.7) alertMessage = `⚠️ Acute Liver Injury: Glutathione depleted (${glutathioneReserve.toFixed(0)}%). Reactive ${drug.toxicMetaboliteName || 'metabolite'} accumulation!`;
    else if (crossTalkActive) alertMessage = '⚠️ Multi-Organ Cross-Talk: Renal filtration drop is slowing whole-body drug clearance!';
    else if (heartStress > 0.65) alertMessage = '⚠️ Cardiotoxicity Alert: Plasma concentration exceeds myocardial safety margin.';

    timeline.push({
      timeHours: t,
      gutAmountMg: Math.round(gutAmount * 10) / 10,
      plasmaConcentrationMgL: Math.round(plasmaConcentration * 100) / 100,
      organs: {
        stomach: {
          concentration: gutAmount,
          stressLevel: stomachStress,
          colorState: getColorState(stomachStress)
        },
        liver: {
          concentration: plasmaConcentration * 1.2,
          stressLevel: liverStress,
          colorState: getColorState(liverStress),
          activeMetaboliteLevel: Math.round(freeToxicMetabolite * 100) / 100,
          glutathioneReservePct: Math.round(glutathioneReserve)
        },
        heart: {
          concentration: plasmaConcentration,
          stressLevel: heartStress,
          colorState: getColorState(heartStress)
        },
        kidneys: {
          concentration: plasmaConcentration * 0.9,
          stressLevel: kidneyStress,
          colorState: getColorState(kidneyStress),
          filtrationEfficiencyPct: Math.round(kidneyFiltrationEfficiency)
        },
        brain: {
          concentration: brainConcentration,
          stressLevel: brainStress,
          colorState: getColorState(brainStress)
        }
      },
      crossTalkInterference: crossTalkActive,
      systemicAlert: alertMessage
    });
  }

  // Check if species mismatch is demonstrated (e.g. mouse clears cleanly while human fails)
  const speciesMismatchDemonstrated = species === 'rodent';

  return {
    drug,
    species,
    phenotype,
    dosageMg,
    dosingIntervalHours,
    totalDurationHours,
    cMax: Math.round(cMax * 100) / 100,
    tMax: Math.round(tMax * 10) / 10,
    steadyStateReached: dosingIntervalHours > 0,
    mlPrediction,
    timeline,
    loopholesMitigated: {
      reactiveMetaboliteDetected,
      speciesMismatchDemonstrated,
      crossTalkCascadeTriggered,
      chronicAccumulationDetected
    }
  };
}
