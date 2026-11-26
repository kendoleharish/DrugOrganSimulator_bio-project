import { useRef } from 'react';
import { ATTRIBUTION } from 'open-anatomy-3d';

export function ResearchMethods() {
  const dialog = useRef<HTMLDialogElement>(null);
  return <>
    <button type="button" className="ui-button ui-button-ghost" onClick={() => dialog.current?.showModal()}>Methods & evidence</button>
    <dialog ref={dialog} className="research-dialog" aria-labelledby="methods-title">
      <header><h2 id="methods-title">Model & evidence</h2><button onClick={() => dialog.current?.close()}>Close</button></header>
      <p>Educational research demonstration. Results describe the stated mathematical scenario and its assumptions.</p>
      <section className="data-section">
        <h3>Systemic pharmacokinetics</h3>
        <p>G is oral depot amount (mg), A is central drug amount (mg), V is apparent volume (L), and C = A/V (mg/L).</p>
        <p>dG/dt = −ka × G</p><p>dA/dt = F × ka × G − (CLh + CLr) × C</p>
        <p>ka uses h⁻¹. Clearance uses L/h. Oral input enters the depot. IV bolus enters the central compartment. Elimination overlays display cumulative eliminated mass in mg. Other structures provide anatomical context.</p>
      </section>
      <details open><summary>Benchmark parameter register</summary>
        <table><thead><tr><th>Profile</th><th>ka (h⁻¹)</th><th>V (L/kg)</th><th>CLh / CLr (L/h)</th><th>Oral F</th></tr></thead>
          <tbody><tr><th>Paracetamol</th><td>1.5</td><td>0.95</td><td>18 / 1.2</td><td>0.68</td></tr><tr><th>Ibuprofen</th><td>1.1</td><td>0.15</td><td>3.5 / 0.5</td><td>1 assumed</td></tr><tr><th>Caffeine</th><td>2.2</td><td>0.60</td><td>5.4 / 0.3</td><td>1 assumed</td></tr><tr><th>Doxorubicin</th><td>IV</td><td>25</td><td>30 / 4.5</td><td>IV only</td></tr></tbody></table>
        <p>These reference coefficients are inherited teaching scenarios. Their use across drugs and species requires further empirical validation.</p>
      </details>
      <details><summary>Compare published paracetamol evidence</summary>
        <p>Human oral 500 mg studies illustrate formulation and study differences. Concentration units are harmonized using 1 µg/mL = 1 mg/L.</p>
        <table><thead><tr><th>Source / arm</th><th>Cmax (mg/L)</th><th>Tmax (h)</th><th>AUC∞ (mg·h/L)</th></tr></thead><tbody>
          <tr><th>FDA review, acetaminophen-alone arm</th><td>7.16 mean</td><td>Uncurated</td><td>Uncurated</td></tr>
          <tr><th>Portolés 2003, reference tablet</th><td>8.33 ± 2.22</td><td>0.75 median</td><td>28.49 ± 8.57</td></tr>
          <tr><th>Portolés 2003, test tablet</th><td>9.85 ± 2.40</td><td>0.42 median</td><td>30.16 ± 8.87</td></tr>
        </tbody></table>
        <p>Portolés studied 24 healthy adults in a randomized crossover. Plasma measurements used HPLC through 14 h. Participants fasted overnight. ± values are reported standard deviations. FDA conditions require source review. These summaries support comparison across studies with differing formulations and sampling.</p>
        <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4053016/" target="_blank" rel="noreferrer">Portolés and colleagues, 2003</a>
      </details>
      <details><summary>Published measurement comparison</summary>
        <p>Human oral paracetamol, 500 mg, baseline 70 kg. Three approximate mean observations digitized from Figure 1, printed page 35 of the FDA review.</p>
        <table><thead><tr><th>Time (h)</th><th>Observed (mg/L)</th><th>Calculated (mg/L)</th></tr></thead><tbody><tr><td>3</td><td>2.6</td><td>2.59</td></tr><tr><td>4</td><td>1.8</td><td>1.98</td></tr><tr><td>5</td><td>1.4</td><td>1.49</td></tr></tbody></table>
        <p>Three-point RMSE 0.116 mg/L. Model peak 3.45 mg/L versus reported mean peak 7.16 mg/L, approximately 52% lower. Digitization precision is limited. Full-curve and tissue validity remain unestablished.</p>
        <a href="https://www.accessdata.fda.gov/drugsatfda_docs/nda/99/21087_Tamiflu_bior.pdf" target="_blank" rel="noreferrer">FDA study source</a>
      </details>
      <details><summary>Mouse comparison assumptions</summary><p>Reference masses are 70 kg and 0.025 kg. Both receive equal mg/kg input. Volume scales with mass. Absolute clearance scales with mass⁰·⁷⁵. Absorption remains constant. Species-specific metabolic and tissue measurements remain to be incorporated.</p></details>
      <details><summary>ML evaluation and data</summary><p>The experimental 15-neighbor estimator predicts human IV terminal half-life from molecular weight, H-bond acceptors, H-bond donors, and polar surface area. Identical descriptor groups stay together. Training contains 989 groups, and a fixed hash split holds out 244 groups. Related scaffolds can cross partitions.</p><p>Held-out log₁₀ MAE is 0.435, versus 0.460 for a constant baseline. Median fold error is 2.46. Compound lookup displays descriptor-range screening and the model’s limits.</p><a href="https://github.com/srijitseal/PKSmart" target="_blank" rel="noreferrer">PKSmart source</a></details>
      <details><summary>Evidence gaps and research questions</summary><p>Priority measurements include mouse concentration–time curves, organ-specific tissue concentrations, and drug-specific exposure–response relationships. Compare predictions against independent studies before expanding their applicability. These prompts support student research discussion.</p></details>
      <details><summary>Anatomy credits</summary><p>{ATTRIBUTION}</p><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0 license</a></details>
    </dialog>
  </>;
}
