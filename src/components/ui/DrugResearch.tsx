import React, { useEffect, useRef, useState } from 'react';
import { HalfLifeModel, predictHalfLife } from '../../engine/ml';

interface Compound {
  CID: number;
  IUPACName: string;
  MolecularFormula: string;
  MolecularWeight: string;
  HBondAcceptorCount: number;
  HBondDonorCount: number;
  TPSA: number;
}

export function DrugResearch() {
  const dialog = useRef<HTMLDialogElement>(null);
  const request = useRef<AbortController | null>(null);
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState<Compound[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState('Search for a chemical identity.');
  const [busy, setBusy] = useState(false);
  const [model, setModel] = useState<HalfLifeModel | null>(null);
  const [modelError, setModelError] = useState('');
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/research/half-life-model.json', { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Model unavailable'); return response.json(); })
      .then(setModel)
      .catch(() => { if (!controller.signal.aborted) setModelError('The ML model could not load. Reopen this page to retry.'); });
    return () => controller.abort();
  }, []);

  async function search(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const timeout = window.setTimeout(() => {
      controller.abort();
      if (request.current === controller) {
        setBusy(false);
        setStatus('The lookup timed out. Please retry.');
      }
    }, 15000);
    setBusy(true);
    setRecords([]);
    setSelected(null);
    setStatus('Retrieving PubChem records…');
    try {
      const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query.trim())}/property/IUPACName,MolecularFormula,MolecularWeight,HBondAcceptorCount,HBondDonorCount,TPSA/JSON`, { signal: controller.signal });
      if (response.status === 404) throw new Error('No match. Try the generic chemical name.');
      if (!response.ok) throw new Error('PubChem is unavailable. Please retry.');
      const data = await response.json();
      if (!Array.isArray(data.PropertyTable?.Properties)) throw new Error('No compound records returned.');
      setRecords(data.PropertyTable.Properties);
      setStatus('Review the source and confirm the intended compound.');
    } catch (error) {
      if (!controller.signal.aborted) setStatus(error instanceof Error ? error.message : 'Lookup failed. Please retry.');
    } finally {
      window.clearTimeout(timeout);
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  return <>
    <button type="button" className="ui-button ui-button-primary" onClick={() => dialog.current?.showModal()}>Research a drug</button>
    <dialog ref={dialog} className="research-dialog" aria-labelledby="drug-research-title">
      <header><h2 id="drug-research-title">Drug evidence</h2><button onClick={() => dialog.current?.close()}>Close</button></header>
      <p>Educational research demonstration. Chemical identity provides a starting point for reviewing pharmacokinetic evidence.</p>
      <form onSubmit={search} style={{ display: 'grid', gap: 12 }}>
        <label htmlFor="drug-query">Drug or chemical name</label>
        <input id="drug-query" value={query} onChange={event => setQuery(event.target.value)} required maxLength={160} style={{ padding: 12, background: '#18181a', color: 'white' }} />
        <button disabled={busy}>{busy ? 'Searching…' : 'Find identity'}</button>
      </form>
      <p role="status" aria-live="polite">{status}</p>
      {records.map(record => <section key={record.CID} style={{ borderTop: '1px solid #454549', paddingBlock: 16, overflowWrap: 'anywhere' }}>
        <h3>{record.IUPACName}</h3>
        <p>{record.MolecularFormula} · {record.MolecularWeight} g/mol · CID {record.CID}</p>
        <a href={`https://pubchem.ncbi.nlm.nih.gov/compound/${record.CID}`} target="_blank" rel="noreferrer">PubChem source</a>
        <button aria-pressed={selected === record.CID} onClick={() => setSelected(record.CID)}>{selected === record.CID ? 'Identity confirmed' : 'Confirm identity'}</button>
      </section>)}
      {selected !== null && <p>A simulation requires a curated PK profile. Select a supported benchmark in the simulator to explore its calculated results.</p>}
      {modelError && <p role="alert">{modelError}</p>}
      {selected !== null && model && records.filter(record => record.CID === selected).map(record => {
        const features = [Number(record.MolecularWeight), record.HBondAcceptorCount, record.HBondDonorCount, record.TPSA];
        if (features.some(value => !Number.isFinite(value))) return <p key={record.CID}>Required molecular descriptors are missing.</p>;
        const prediction = predictHalfLife(model, features);
        return <section key={record.CID} className="data-section">
          <h3>Experimental ML estimate · human IV half-life</h3>
          <strong>{prediction.withinRange ? `${prediction.hours.toFixed(2)} h` : 'Outside descriptor range'}</strong>
          {prediction.withinRange && <details><summary>Explore the estimated elimination curve</summary>
            <p>Equation-derived fraction remaining = 2⁻⁽ᵗ⁄ᵗ½⁾. This illustration assumes a single, well-mixed compartment with first-order elimination and uses the ML half-life estimate. Tissue distribution and absorption require additional parameters.</p>
            <table><thead><tr><th>Elapsed time (h)</th><th>Calculated fraction remaining (%)</th></tr></thead><tbody>{[0, 1, 2, 4, 8, 12, 24].map(hours => <tr key={hours}><td>{hours}</td><td>{(100 * 2 ** (-hours / prediction.hours)).toFixed(2)}</td></tr>)}</tbody></table>
          </details>}
          <p>{model.trainingCount} training groups · {model.testCount} held-out groups. Median held-out fold error {model.metrics.medianFoldError.toFixed(2)}×.</p>
          <p>Log₁₀ MAE {model.metrics.log10MAE.toFixed(3)}. Median baseline MAE {model.metrics.baselineLog10MAE.toFixed(3)}. Descriptor range checks provide limited applicability screening.</p>
          <p>This compound may be represented in the training records. Held-out scores describe the fixed evaluation partition.</p>
          {model.limitations.map(limit => <p key={limit}>{limit}</p>)}
          <a href="https://github.com/srijitseal/PKSmart" target="_blank" rel="noreferrer">Training data and research source</a>
        </section>;
      })}
    </dialog>
  </>;
}
