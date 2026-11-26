import type { AdministrationRoute, DrugProfile, PatientPhenotype, SimulationResult, SimulationTimeStep, Species } from './types';
import { getPhysiologicalParameters } from './allometric_scaling';

export const SAMPLE_HOURS = 0.1;
const STEADY_STATE_TOLERANCE = 0.01;

export const defaultRoute = (drug: DrugProfile): AdministrationRoute =>
  drug.id === 'doxorubicin' ? 'iv' : 'oral';

export function runPharmacokineticSimulation(
  drug: DrugProfile,
  dosageMg: number,
  species: Species = 'human',
  phenotype: PatientPhenotype = 'healthy_adult',
  dosingIntervalHours = 0,
  totalDurationHours = 24,
  route: AdministrationRoute = defaultRoute(drug)
): SimulationResult {
  const phys = getPhysiologicalParameters(species, phenotype);
  const dose = dosageMg * phys.bodyWeightKg / 70;
  const volume = drug.volumeOfDistributionVd * phys.bodyWeightKg;
  const ka = drug.absorptionRateKa;
  const hepatic = drug.baseHepaticClearance * phys.hepaticMetabolicFactor;
  const renal = drug.baseRenalClearance * phys.renalFiltrationFactor;
  const clearance = hepatic + renal;
  const ke = clearance / volume;
  const availability = route === 'oral' ? (drug.oralBioavailability ?? 1) : 1;

  if (![dose, dosingIntervalHours, totalDurationHours, volume, ka, ke, hepatic, renal, availability].every(Number.isFinite)
    || dose < 0 || totalDurationHours <= 0 || totalDurationHours > 168
    || dosingIntervalHours < 0 || (dosingIntervalHours > 0 && dosingIntervalHours < 0.1)
    || volume <= 0 || ka <= 0 || ke <= 0 || hepatic < 0 || renal < 0
    || availability < 0 || availability > 1
    || (route !== 'oral' && route !== 'iv') || (drug.id === 'doxorubicin' && route !== 'iv')) {
    throw new RangeError('Invalid model parameters or unsupported route.');
  }

  let gut = 0;
  let central = 0;
  let systemicLoss = 0;
  let presystemicLoss = 0;
  let time = 0;
  let doseCount = 0;
  let cMax = 0;
  let tMax = 0;
  let steadyStateHour: number | null = null;
  let previousPredose: [number, number] | undefined;
  let stableCycles = 0;
  const timeline: SimulationTimeStep[] = [];
  const apapMechanism = drug.id === 'paracetamol' && species === 'human';

  // Illustrative hepatic oxidation fraction and 1:1 NAPQI-GSH stoichiometry.
  const oxidizedUmolPerMg = 0.08 * 1000 / drug.properties.molecularWeight;

  const advance = (target: number) => {
    const dt = target - time;
    if (dt <= 0) return;
    const gutDecay = Math.exp(-ka * dt);
    const centralDecay = Math.exp(-ke * dt);
    const rateDifference = ka - ke;
    const transfer = Math.abs(rateDifference * dt) < 1e-6
      ? centralDecay * dt * (1 - rateDifference * dt / 2)
      : (centralDecay - gutDecay) / rateDifference;
    const absorbed = gut * -Math.expm1(-ka * dt);
    const nextCentral = central * centralDecay + availability * ka * gut * transfer;
    systemicLoss += Math.max(0, central + availability * absorbed - nextCentral);
    presystemicLoss += (1 - availability) * absorbed;
    gut *= gutDecay;
    central = nextCentral;
    time = target;
  };

  const recordPeak = () => {
    const concentration = central / volume;
    if (concentration > cMax) {
      cMax = concentration;
      tMax = time;
    }
  };

  const administer = () => {
    if (doseCount > 0 && dose > 0) {
      if (previousPredose) {
        const scale = [gut, central].map((amount, i) => Math.max(amount, previousPredose![i], dose * 1e-6));
        const stable = Math.abs(gut - previousPredose[0]) <= STEADY_STATE_TOLERANCE * scale[0]
          && Math.abs(central - previousPredose[1]) <= STEADY_STATE_TOLERANCE * scale[1];
        stableCycles = stable ? stableCycles + 1 : 0;
        if (stableCycles === 2) steadyStateHour = time;
      }
      previousPredose = [gut, central];
    }
    if (route === 'oral') gut += dose;
    else central += dose;
    doseCount += 1;
    recordPeak();
  };

  administer();
  const sampleCount = Math.ceil(totalDurationHours / SAMPLE_HOURS);
  for (let index = 0; index <= sampleCount; index += 1) {
    const sampleTime = Math.min(index * SAMPLE_HOURS, totalDurationHours);
    if (dosingIntervalHours > 0) {
      let nextDoseTime = doseCount * dosingIntervalHours;
      while (nextDoseTime < totalDurationHours - 1e-9 && nextDoseTime <= sampleTime + 1e-9) {
        advance(nextDoseTime);
        recordPeak();
        administer();
        nextDoseTime = doseCount * dosingIntervalHours;
      }
    }
    advance(sampleTime);
    recordPeak();
    const hepaticMg = systemicLoss * hepatic / clearance;
    timeline.push({
      timeHours: sampleTime,
      gutAmountMg: gut,
      plasmaConcentrationMgL: central / volume,
      centralAmountMg: central,
      hepaticEliminatedMg: hepaticMg,
      renalEliminatedMg: systemicLoss * renal / clearance,
      presystemicLossMg: presystemicLoss,
      administeredMg: doseCount * dose,
      gshDemandUmol: apapMechanism ? hepaticMg * oxidizedUmolPerMg : undefined,
      napqiFormationRateUmolH: apapMechanism
        ? hepatic * central / volume * oxidizedUmolPerMg
        : undefined
    });
  }

  return {
    drug, species, phenotype, dosageMg, dosingIntervalHours, totalDurationHours, route,
    administeredDoseMg: dose, cMax, tMax, steadyStateHour, doseCount, timeline,
    steadyStateReached: steadyStateHour !== null
  };
}
