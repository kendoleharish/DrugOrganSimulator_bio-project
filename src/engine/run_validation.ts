import { BENCHMARK_DRUGS } from './drugs_dataset';
import { runPharmacokineticSimulation } from './pharmacokinetics';
import { sensitivity, validationMetrics, observedPlasma } from './validation';

const baseline = runPharmacokineticSimulation(BENCHMARK_DRUGS[0], 500);
console.table(observedPlasma.map(point => ({
  hours: point.timeHours, approximateObservedMgL: point.concentrationMgL,
  simulatedMgL: baseline.timeline.find(row => row.timeHours === point.timeHours)!.plasmaConcentrationMgL
})));
console.log(JSON.stringify(validationMetrics(baseline)));
console.table(sensitivity());
