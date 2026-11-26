import assert from 'node:assert/strict';
import { BENCHMARK_DRUGS } from './drugs_dataset';
import { runPharmacokineticSimulation as simulate } from './pharmacokinetics';
import { referenceApplies, sensitivity, validationMetrics } from './validation';

const drug = BENCHMARK_DRUGS[0];
function close(actual: number, expected: number, tolerance = 1e-8) {
  assert.ok(Math.abs(actual - expected) <= tolerance, actual + ' differs from ' + expected);
}
const baseline = simulate(drug, 500);
close(baseline.timeline[0].gutAmountMg, 500);
close(baseline.timeline[0].plasmaConcentrationMgL, 0);
assert.equal(baseline.steadyStateReached, false);
assert.ok(referenceApplies(baseline));
assert.ok(validationMetrics(baseline)!.rmseMgL > 0);
assert.equal(sensitivity().length, 8);

for (const profile of BENCHMARK_DRUGS) {
  for (const species of ['human', 'rodent'] as const) {
    const result = simulate(profile, 500, species, 'healthy_adult', 3.43, 24);
    assert.equal(result.doseCount, 7);
    for (const step of result.timeline) {
      const compartments = [step.gutAmountMg, step.centralAmountMg, step.renalEliminatedMg, step.hepaticEliminatedMg, step.presystemicLossMg];
      assert.ok(compartments.every(n => n >= 0 && Number.isFinite(n)));
      close(compartments.reduce((sum, n) => sum + n, 0), step.administeredMg);
      assert.equal(step.napqiFormationRateUmolH !== undefined, species === 'human' && profile.id === 'paracetamol');
    }
  }
}

const volume = 70 * drug.volumeOfDistributionVd;
const k = (drug.baseHepaticClearance + drug.baseRenalClearance) / volume;
const iv = simulate(drug, 500, 'human', 'healthy_adult', 0, 24, 'iv');
for (const step of iv.timeline) close(step.plasmaConcentrationMgL, 500 / volume * Math.exp(-k * step.timeHours));
const equalRates = simulate({ ...drug, absorptionRateKa: k }, 500);
for (const step of equalRates.timeline) close(step.centralAmountMg, 500 * drug.oralBioavailability! * k * step.timeHours * Math.exp(-k * step.timeHours));
const repeat = simulate(drug, 500, 'human', 'healthy_adult', 8, 48);
assert.equal(repeat.doseCount, 6);
assert.equal(repeat.steadyStateReached, true);
assert.equal(simulate(drug, 500, 'human', 'healthy_adult', 8, 16).steadyStateReached, false);
assert.equal(simulate(drug, 0).cMax, 0);
for (const invalid of [-1, Infinity, NaN]) assert.throws(() => simulate(drug, invalid), RangeError);
assert.throws(() => simulate(BENCHMARK_DRUGS[3], 60, 'human', 'healthy_adult', 0, 24, 'oral'), RangeError);
console.log('Passed mass conservation, positivity, analytic solutions, dosing events, steady state, parameter bounds, mechanism scope and validation checks.');
