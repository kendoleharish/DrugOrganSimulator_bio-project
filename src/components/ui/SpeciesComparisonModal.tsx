import { useEffect, useRef } from 'react';
import type { DrugProfile, SimulationResult } from '../../engine/types';
import { PlasmaChart } from './PlasmaChart';
import { getPhysiologicalParameters } from '../../engine/allometric_scaling';
import { exposureAuc } from '../../engine/exposure';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  drug: DrugProfile;
  humanResult: SimulationResult;
  mouseResult: SimulationResult;
}

export function SpeciesComparisonModal({ isOpen, onClose, drug, humanResult, mouseResult }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const human = getPhysiologicalParameters('human', 'healthy_adult');
  const mouse = getPhysiologicalParameters('rodent', 'healthy_adult');
  const parameters = [
    ['Body mass (kg)', human.bodyWeightKg, mouse.bodyWeightKg],
    ['Apparent volume (L)', drug.volumeOfDistributionVd * human.bodyWeightKg, drug.volumeOfDistributionVd * mouse.bodyWeightKg],
    ['Total clearance (L/h)', drug.baseHepaticClearance + drug.baseRenalClearance, (drug.baseHepaticClearance + drug.baseRenalClearance) * mouse.hepaticMetabolicFactor],
    ['AUC over 24 h (mg·h/L)', exposureAuc(humanResult), exposureAuc(mouseResult)],
  ] as const;
  useEffect(() => {
    if (isOpen) dialog.current?.showModal();
    else dialog.current?.close();
  }, [isOpen]);

  return (
    <dialog ref={dialog} onCancel={onClose} className="research-dialog" aria-labelledby="species-heading">
      <header><h2 id="species-heading">Species comparison</h2><button onClick={onClose}>Close</button></header>
      <p>{drug.name} · {humanResult.route === 'iv' ? 'IV bolus' : 'Oral'} · Single dose</p>
      <PlasmaChart result={humanResult} label="Human simulation" comparison={mouseResult} />
      <table><thead><tr><th>Scenario</th><th>Dose (mg)</th><th>Peak (mg/L)</th><th>Peak time (h)</th></tr></thead>
        <tbody>{[humanResult, mouseResult].map(result => <tr key={result.species}>
          <th>{result.species === 'human' ? 'Human · 70 kg' : 'Mouse scenario · 25 g'}</th>
          <td>{result.administeredDoseMg.toPrecision(4)}</td><td>{result.cMax.toFixed(2)}</td><td>{result.tMax.toFixed(1)}</td>
        </tr>)}</tbody>
      </table>
      <table><thead><tr><th>Parameter</th><th>Human</th><th>Mouse</th><th>Mouse / human</th></tr></thead><tbody>{parameters.map(([label, humanValue, mouseValue]) => <tr key={label}><th>{label}</th><td>{humanValue.toPrecision(4)}</td><td>{mouseValue.toPrecision(4)}</td><td>{humanValue ? (mouseValue / humanValue).toPrecision(4) : 'Undefined'}</td></tr>)}</tbody></table>
      <p>Both scenarios use the same input in mg/kg. Clearance scales with body mass to the power of 0.75, and apparent volume scales with mass. This educational comparison has no measured mouse data or species-specific metabolism, binding, or toxicity.</p>
    </dialog>
  );
}
