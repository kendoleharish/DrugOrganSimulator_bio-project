import { useMemo, useRef } from 'react';
import type { SimulationResult } from '../../engine/types';
import { runPharmacokineticSimulation } from '../../engine/pharmacokinetics';
import { exposureAuc } from '../../engine/exposure';

export function ScenarioComparison({ result }: { result: SimulationResult }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const scenarios = useMemo(() => [0.5, 1, 2].map(multiplier => ({ multiplier,
    run: runPharmacokineticSimulation(result.drug, result.dosageMg * multiplier, result.species,
      result.phenotype, result.dosingIntervalHours, result.totalDurationHours, result.route),
  })), [result]);
  return <>
    <button className="workspace-toggle scenario-launch" onClick={() => dialog.current?.showModal()}>Compare doses</button>
    <dialog ref={dialog} className="research-dialog" aria-labelledby="scenario-title">
      <header><h2 id="scenario-title">Dose experiment</h2><button onClick={() => dialog.current?.close()}>Close</button></header>
      <p>{result.drug.name} · {result.species === 'human' ? 'Human' : 'Mouse scaling'} · {result.route.toUpperCase()} · {result.dosingIntervalHours ? `every ${result.dosingIntervalHours} h` : 'single dose'}</p>
      <p>Calculated scenarios use linear first-order kinetics. Doubling the input doubles exposure under these assumptions. Saturable metabolism and injury require additional models.</p>
      <table><thead><tr><th>Input multiplier</th><th>Actual dose (mg)</th><th>Cmax (mg/L)</th><th>AUC₀–{result.totalDurationHours} (mg·h/L)</th></tr></thead><tbody>
        {scenarios.map(({multiplier, run}) => <tr key={multiplier}><th>{multiplier}×</th><td>{run.administeredDoseMg.toPrecision(4)}</td><td>{run.cMax.toFixed(3)}</td><td>{exposureAuc(run).toFixed(3)}</td></tr>)}
      </tbody></table>
      <p>The 1× row reflects the active scenario. Mouse input uses the same mg/kg as the 70 kg reference dose.</p>
    </dialog>
  </>;
}
