import { PlasmaChart } from './PlasmaChart';
import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Heart, 
  ShieldAlert, 
  CheckCircle2, 
  AlertOctagon, 
  Gauge, 
  Focus, 
  Maximize2, 
  X, 
  Search, 
  Layers, 
  ChevronRight,
  Sparkles,
  Info,
  Dna
} from 'lucide-react';
import { anatomyMetric } from '../../engine/anatomyMetrics';
import { ORGAN_INFO_MAP } from '../../types/ui';
import { 
  SimulationTimeStep, 
  DrugProfile, 
  SimulationResult 
} from '../../engine/types';
import { ANATOMY_BY_KEY, ANATOMY_STRUCTURES } from 'open-anatomy-3d';

interface ClinicalOrganDossierProps {
  selectedKey: string | null;
  currentStep: SimulationTimeStep;
  drug: DrugProfile;
  simulationResult: SimulationResult;
  isolatedKey: string | null;
  onSelectKey: (key: string | null) => void;
  onToggleIsolation: (key: string) => void;
  onFocusCamera: () => void;
}

export const ClinicalOrganDossier: React.FC<ClinicalOrganDossierProps> = ({
  selectedKey,
  currentStep,
  drug,
  simulationResult,
  isolatedKey,
  onSelectKey,
  onToggleIsolation,
  onFocusCamera
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Vital Organs');

  // Filtered structures for anatomical directory
  const filteredStructures = useMemo(() => {
    let list = ANATOMY_STRUCTURES;
    if (selectedCategory === 'Vital Organs') {
      list = list.filter((s) => s.system === 'organs' || s.key === 'heart');
    } else if (selectedCategory === 'Cardiovascular') {
      list = list.filter((s) => s.system === 'vessels' || s.key === 'heart' || s.category === 'Cardiovascular');
    } else if (selectedCategory === 'Respiratory') {
      list = list.filter((s) => s.category === 'Respiratory' || ['lung_l', 'lung_r', 'bronchi', 'trachea', 'larynx'].includes(s.key));
    } else if (selectedCategory === 'Digestive') {
      list = list.filter((s) => s.category === 'Digestive' || ['stomach', 'liver', 'gallbladder', 'colon', 'small_intestine', 'esophagus', 'pancreas'].includes(s.key));
    } else if (selectedCategory === 'Urinary') {
      list = list.filter((s) => s.category === 'Renal / Urinary' || ['kidney_l', 'kidney_r', 'ureter_l', 'ureter_r', 'bladder'].includes(s.key));
    } else if (selectedCategory === 'Nervous') {
      list = list.filter((s) => s.system === 'nerves' || s.category === 'Neurological' || ['brain', 'brainstem', 'cerebellum'].includes(s.key));
    } else if (selectedCategory === 'Musculoskeletal') {
      list = list.filter((s) => s.system === 'skeleton' || s.system === 'muscles' || s.system === 'joints');
    } else if (selectedCategory === 'Endocrine') {
      list = list.filter((s) => s.category === 'Endocrine' || s.category === 'Immune / Lymphatic' || ['pancreas', 'adrenal_l', 'adrenal_r', 'pituitary', 'spleen', 'thymus'].includes(s.key));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.label.toLowerCase().includes(q) || s.key.toLowerCase().includes(q));
    }

    return list;
  }, [searchQuery, selectedCategory]);

  // Selected structure details lookup
  const selectedDetails = useMemo(() => {
    if (!selectedKey) return null;
    const catalogInfo = ANATOMY_BY_KEY[selectedKey];
    const clinicalInfo = ORGAN_INFO_MAP[selectedKey];

    const metric = anatomyMetric(selectedKey, currentStep);

    return {
      key: selectedKey,
      label: catalogInfo?.label || clinicalInfo?.name || selectedKey,
      latinName: clinicalInfo?.latinName || catalogInfo?.label,
      system: catalogInfo?.system || clinicalInfo?.system || 'Anatomical Structure',
      category: catalogInfo?.category || clinicalInfo?.category || 'Physiology',
      fmaId: clinicalInfo?.fmaId,
      description: clinicalInfo?.description || 'Segmented anatomical structure mapped from human physiological data.',
      primaryFunction: clinicalInfo?.primaryFunction || 'Integral physiological function within systemic human anatomy.',
      clinicalSignificance: clinicalInfo?.clinicalSignificance || 'See anatomy references for this structure.',
      vulnerabilityFactor: clinicalInfo?.vulnerabilityFactor || '',
      metric
    };
  }, [selectedKey, currentStep, drug]);

  const isIsolated = isolatedKey === selectedKey && selectedKey !== null;

  return (
    <aside id="data-inspector" data-reveal
      aria-label="Clinical Organ Dossier and Pharmacokinetic Telemetry"
      className="workspace-inspector absolute top-16 right-4 z-20 w-84 max-w-[340px] rounded-xl bg-slate-950/85 border border-white/10 shadow-2xl backdrop-blur-md text-xs select-none flex flex-col max-h-[calc(100vh-140px)] transition-all duration-200"
    >
      {/* 1. SELECTED STRUCTURE DOSSIER VIEW */}
      {selectedKey && selectedDetails ? (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-3.5 border-b border-white/10 flex items-start justify-between bg-slate-900/60">
            <div>
              <div className="flex items-center space-x-1.5 mb-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                  {selectedDetails.system}
                </span>
                {selectedDetails.fmaId && (
                  <span className="text-[9px] font-mono text-slate-400 px-1 py-0.2 rounded bg-slate-800">
                    {selectedDetails.fmaId}
                  </span>
                )}
              </div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {selectedDetails.label}
              </h2>
              {selectedDetails.latinName && selectedDetails.latinName !== selectedDetails.label && (
                <div className="text-[11px] text-slate-400 italic font-serif">
                  {selectedDetails.latinName}
                </div>
              )}
            </div>
            <button
              aria-label="Close selected structure"
              onClick={() => onSelectKey(null)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Toolbar: Isolate & Focus */}
          <div className="grid grid-cols-2 gap-1.5 px-3 py-2 border-b border-white/10 bg-slate-900/30">
            <button
              onClick={() => onToggleIsolation(selectedKey)}
              className={`py-1.5 px-2 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all ${
                isIsolated
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/10'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{isIsolated ? 'Isolated' : 'Isolate in 3D'}</span>
            </button>

            <button
              onClick={onFocusCamera}
              className="py-1.5 px-2 rounded-lg font-semibold text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/10 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Focus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Focus Camera</span>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-3 space-y-3 overflow-y-auto custom-scrollbar flex-1">
            <section className="data-section">
              <h3>{selectedDetails.metric ? selectedDetails.metric.label : 'Anatomy only'}</h3>
              {selectedDetails.metric ? <>
                <strong>{selectedDetails.metric.amountMg.toFixed(2)} mg</strong>
                <p>{selectedDetails.metric.detail}</p>
                {selectedKey === 'liver' && currentStep.napqiFormationRateUmolH !== undefined &&
                  <p>Illustrative NAPQI formation: {currentStep.napqiFormationRateUmolH.toFixed(2)} µmol/h. Cumulative GSH demand under complete conjugation: {currentStep.gshDemandUmol?.toFixed(2)} µmol.</p>}
              </> : <p>Local exposure and biological effects are outside the model.</p>}
            </section>
            {/* Anatomical Details & Physiology */}
            <div className="space-y-2 text-[11px] text-slate-300">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">
                  Anatomical Structure & Morphology
                </div>
                <p className="leading-relaxed text-slate-300 bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  {selectedDetails.description}
                </p>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">
                  Physiological Role
                </div>
                <p className="leading-relaxed text-slate-300 bg-slate-900/40 p-2 rounded-lg border border-white/5">
                  {selectedDetails.primaryFunction}
                </p>
              </div>


            </div>
          </div>
        </div>
      ) : (
        /* 2. SYSTEMIC OVERVIEW & ANATOMICAL INDEX */
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-3.5 border-b border-white/10 bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white tracking-wide uppercase text-[11px]">
                  Anatomy & pharmacokinetics
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-semibold px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                T +{currentStep.timeHours.toFixed(1)}h
              </span>
            </div>
          </div>

          <div className="p-3 space-y-3 overflow-y-auto custom-scrollbar flex-1">
            {/* Plasma Exposure Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-medium">Plasma Conc</div>
                <div className="text-base font-bold font-mono text-cyan-300">
                  {currentStep.plasmaConcentrationMgL.toFixed(2)}{' '}
                  <span className="text-[10px] font-normal text-slate-400">mg/L</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-medium">Peak Cmax</div>
                <div className="text-base font-bold font-mono text-emerald-300">
                  {simulationResult.cMax.toFixed(2)}{' '}
                  <span className="text-[10px] font-normal text-slate-400">mg/L</span>
                </div>
              </div>
            </div>

            <PlasmaChart result={simulationResult} />
            <details className="model-notes"><summary>Model assumptions</summary>
              <p>Well-mixed systemic compartment, first-order absorption and linear clearance. Organ colors track disposition. Tissue concentrations and injury are outside this model.</p>
              <p>Absorption {drug.absorptionRateKa} h⁻¹ · apparent volume {drug.volumeOfDistributionVd} L/kg. Reference hepatic and renal clearance {drug.baseHepaticClearance} and {drug.baseRenalClearance} L/h. Oral availability {drug.oralBioavailability ?? 1}.</p>
            </details>
            {/* Molecular Profile */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                <span>Drug: {drug.properties.name}</span>
                <span>MW: {drug.properties.molecularWeight} g/mol</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                <span>LogP: {drug.properties.logP}</span>
                <span>Route: {simulationResult.route.toUpperCase()}</span>
              </div>
            </div>

            {/* Anatomical Structure Explorer */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <span>Structure Directory</span>
                </span>
                <span className="text-[9px] text-slate-400 font-mono">{ANATOMY_STRUCTURES.length} structures</span>
              </div>

              {/* Search box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  aria-label="Search structures" placeholder="Filter organs, bones, vessels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1 overflow-x-auto pb-1 text-[10px] custom-scrollbar">
                {['All', 'Vital Organs', 'Cardiovascular', 'Respiratory', 'Digestive', 'Urinary', 'Nervous', 'Musculoskeletal', 'Endocrine'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Structure List */}
              <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {filteredStructures.map((struct) => (
                  <button
                    key={struct.key}
                    onClick={() => onSelectKey(struct.key)}
                    className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-white/5 text-left text-[11px] text-slate-300 hover:text-white transition-all group"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: struct.color }}
                      />
                      <span className="truncate">{struct.label}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
