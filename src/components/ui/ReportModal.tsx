import { useEffect, useRef, useState } from 'react';
import type { DrugProfile, SimulationResult } from '../../engine/types';
import { PlasmaChart } from './PlasmaChart';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  result: SimulationResult;
  drug: DrugProfile;
}

export function ReportModal({ isOpen, onClose, result, drug }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const last = result.timeline[result.timeline.length - 1];
  function exportScenario() {
    const record = {
      schemaVersion: 1,
      modelVersion: 'first-order-pk-v1',
      generatedAt: new Date().toISOString(),
      purpose: 'Educational research demonstration',
      parameterProvenance: 'docs/MODEL_ASSUMPTIONS.md',
      validationRecord: 'docs/VALIDATION.md',
      sources: ['https://www.accessdata.fda.gov/drugsatfda_docs/nda/99/21087_Tamiflu_bior.pdf', 'https://github.com/srijitseal/PKSmart', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4053016/'],
      assumptions: ['Well-mixed apparent central compartment', 'First-order absorption and elimination', 'Mouse scaling uses equal mg/kg input and mass^0.75 clearance'],
      result,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'insilico-scenario.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Scenario and calculated timeline exported.');
  }
  const rows = [
    ['Substance', drug.name],
    ['Scenario', result.species === 'human' ? result.phenotype.replace(/_/g, ' ') : 'Exploratory mouse scaling'],
    ['Administration', result.route === 'oral' ? 'Oral depot' : 'Instantaneous IV bolus'],
    ['Model dose', result.administeredDoseMg.toPrecision(4) + ' mg per administration'],
    ['Schedule', result.doseCount + ' dose(s)' + (result.dosingIntervalHours ? ', every ' + result.dosingIntervalHours + ' h' : '') + ' over ' + result.totalDurationHours + ' h'],
    ['Peak plasma concentration', result.cMax.toFixed(2) + ' mg/L at ' + result.tMax.toFixed(1) + ' h'],
    ['Periodic steady state', result.steadyStateHour === null ? (result.dosingIntervalHours ? 'Not detected' : 'Single dose') : 'Detected at ' + result.steadyStateHour.toFixed(1) + ' h'],
    ['Hepatic parent-drug elimination', last.hepaticEliminatedMg.toFixed(2) + ' mg'],
    ['Renal parent-drug elimination', last.renalEliminatedMg.toFixed(2) + ' mg']
  ];
  useEffect(() => {
    if (isOpen) { dialog.current?.showModal(); setStatus(''); }
    else dialog.current?.close();
  }, [isOpen]);

  async function exportPdf() {
    setBusy(true);
    setStatus('');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      doc.setProperties({ title: 'InSilico-3D Simulation Record' });
      doc.setTextColor(19, 48, 55);
      doc.setFontSize(22);
      doc.text('Simulation record', 18, 24);
      doc.setFontSize(10);
      doc.text('INSILICO-3D  |  EDUCATIONAL PHARMACOKINETICS', 18, 33);
      for (const [index, [label, value]] of rows.entries()) {
        const y = 48 + 7 * index;
        doc.text(label, 18, y);
        doc.text(value, 86, y);
      }
      const x = 27, y = 207, width = 153, height = 75;
      const maximum = result.cMax || 1;
      const chartX = (time: number) => x + width * time / result.totalDurationHours;
      const chartY = (value: number) => y - height * value / maximum;
      doc.setDrawColor(110, 130, 135);
      doc.line(x, y, x + width, y);
      doc.line(x, y, x, y - height);
      for (let i = 0; i <= 4; i += 1) {
        doc.text((maximum * i / 4).toFixed(1), x - 3, chartY(maximum * i / 4) + 1, { align: 'right' });
        doc.text((result.totalDurationHours * i / 4).toFixed(0), chartX(result.totalDurationHours * i / 4), y + 5, { align: 'center' });
      }
      doc.setDrawColor(25, 122, 117);
      doc.setLineWidth(0.45);
      const points = result.timeline;
      for (let i = 1; i < points.length; i += 1) {
        doc.line(chartX(points[i - 1].timeHours), chartY(points[i - 1].plasmaConcentrationMgL),
          chartX(points[i].timeHours), chartY(points[i].plasmaConcentrationMgL));
      }
      doc.text('Simulated plasma concentration (mg/L)', 27, 124);
      doc.text('Time after first dose (h)', 82, 222);
      doc.text(doc.splitTextToSize('Scope: first-order, well-mixed parent-drug model. Clearance is modeled as an elimination process linked to the liver and kidneys. The simulation does not estimate local tissue concentrations or clinical outcomes.', 168), 18, 240);
      doc.setFontSize(9);
      doc.text('Parameter provenance and equations: docs/MODEL_ASSUMPTIONS.md and docs/REFERENCES.md.', 18, 270);
      doc.text('Validation method and model-to-study discrepancies: docs/VALIDATION.md.', 18, 276);
      doc.addPage();
      doc.setFontSize(18);
      doc.text('Methods and provenance', 18, 24);
      doc.setFontSize(10);
      const methods = [
        'Model version: first-order-pk-v1. Purpose: educational research demonstration.',
        'G and A are depot and central amounts (mg). C = A/V (mg/L).',
        'dG/dt = -ka*G; dA/dt = F*ka*G - (CLh+CLr)*C.',
        `Reference ka: ${drug.absorptionRateKa} /h; volume: ${drug.volumeOfDistributionVd} L/kg.`,
        `Reference hepatic clearance: ${drug.baseHepaticClearance} L/h; renal clearance: ${drug.baseRenalClearance} L/h.`,
        `Oral availability: ${drug.oralBioavailability ?? '1 (assumed)'}. Species masses: human 70 kg; mouse 0.025 kg.`,
        'Mouse input uses equal mg/kg; volume scales with mass; clearance scales with mass^0.75.',
        'Lower-clearance scenarios use illustrative fixed multipliers. The source profile is included in scenario JSON.',
        'Validation context: three approximate human 500 mg oral paracetamol observations, RMSE 0.116 mg/L.',
        'Predicted peak 3.45 mg/L versus published 7.16 mg/L. Other profiles and mouse scaling lack empirical validation.',
        'FDA source: https://www.accessdata.fda.gov/drugsatfda_docs/nda/99/21087_Tamiflu_bior.pdf',
        'Additional study: https://pmc.ncbi.nlm.nih.gov/articles/PMC4053016/',
        'ML source: https://github.com/srijitseal/PKSmart. Experimental ML estimates are displayed separately in drug research.',
        'Full parameter register, assumptions, and references are included in the project docs folder.',
      ];
      let methodsY = 40;
      for (const paragraph of methods) {
        const lines = doc.splitTextToSize(paragraph, 172);
        doc.text(lines, 18, methodsY);
        methodsY += lines.length * 5 + 5;
      }
      doc.save('insilico-3d-simulation.pdf');
      setStatus('PDF exported.');
    } catch (error) {
      console.error(error);
      setStatus('PDF export failed. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return <dialog ref={dialog} onCancel={onClose} className="research-dialog" aria-labelledby="report-heading">
    <header><h2 id="report-heading">Simulation record</h2><button onClick={onClose}>Close</button></header>
    <p>Educational pharmacokinetics · {drug.name}</p>
    <PlasmaChart result={result} />
    <table><tbody>{rows.map(([label, value]) => <tr key={label}><th>{label}</th><td>{value}</td></tr>)}</tbody></table>
    <div className="report-actions"><button onClick={exportPdf} disabled={busy}>{busy ? 'Generating…' : 'Export PDF'}</button><button onClick={exportScenario}>Export scenario JSON</button><span role="status">{status}</span></div>
  </dialog>;
}
