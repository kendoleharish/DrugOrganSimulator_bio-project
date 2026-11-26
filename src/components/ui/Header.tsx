import React from 'react';
import { DrugResearch } from './DrugResearch';
import { ResearchMethods } from './ResearchMethods';
import { ViewSwitch } from './ViewSwitch';
import { DrugProfile, Species, PatientPhenotype } from '../../engine/types';
import { BENCHMARK_DRUGS } from '../../engine/drugs_dataset';
interface HeaderProps {
  selectedDrug: DrugProfile;
  species: Species;
  phenotype: PatientPhenotype;
  dosageMg: number;
  onSelectDrug: (drug: DrugProfile) => void;
  onToggleSpecies: (species: Species) => void;
  onSelectPhenotype: (phenotype: PatientPhenotype) => void;
  onSetQuickDose: (dose: number) => void;
  onOpenReport: () => void;
  onOpenSpeciesModal: () => void;
  toolsOpen: boolean;
  inspectorOpen: boolean;
  onToggleTools: () => void;
  onToggleInspector: () => void;
}

export function Header(props: HeaderProps) {
  return <header className="instrument-header">
    <div className="header-primary" data-reveal>
      <div className="instrument-brand"><span className="brand-mark" aria-hidden="true">i</span><div><strong>InSilico</strong><span>Drug disposition lab</span></div></div>
      <nav aria-label="Research workspace">
        <ResearchMethods />
        <button type="button" className="ui-button ui-button-ghost" onClick={props.onOpenSpeciesModal}>Compare species</button>
        <button type="button" className="ui-button ui-button-secondary" onClick={props.onOpenReport}>Export report</button>
        <DrugResearch />
      </nav>
    </div>
    <div className="header-secondary" data-reveal>
    <div className="scenario-controls">
      <label>Benchmark<select value={props.selectedDrug.id} onChange={event => {
        const drug = BENCHMARK_DRUGS.find(item => item.id === event.target.value);
        if (drug) props.onSelectDrug(drug);
      }}>{BENCHMARK_DRUGS.map(drug => <option key={drug.id} value={drug.id}>{drug.name}</option>)}</select></label>
      <label>Species<select value={props.species} onChange={event => props.onToggleSpecies(event.target.value as Species)}><option value="human">Human · 70 kg</option><option value="rodent">Mouse · 25 g</option></select></label>
      <label>Clearance scenario<select disabled={props.species === 'rodent'} value={props.species === 'rodent' ? 'healthy_adult' : props.phenotype} onChange={event => props.onSelectPhenotype(event.target.value as PatientPhenotype)}><option value="healthy_adult">Reference</option><option value="elderly">Lower combined</option><option value="renal_impaired">Lower renal</option><option value="poor_cyp_metabolizer">Lower hepatic</option></select></label>
    </div>
      <div className="view-controls" aria-label="Workspace views">
        <ViewSwitch label="Anatomy tools" checked={props.toolsOpen} controls="anatomy-tools" onChange={props.onToggleTools} />
        <ViewSwitch label="Data inspector" checked={props.inspectorOpen} controls="data-inspector" onChange={props.onToggleInspector} />
      </div>
    </div>
  </header>;
}
