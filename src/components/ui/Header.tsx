import React from 'react';
import { 
  Activity, 
  FileText, 
  Scale, 
  FlaskConical, 
  UserCheck, 
  ChevronDown
} from 'lucide-react';
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
}

export const Header: React.FC<HeaderProps> = ({
  selectedDrug,
  species,
  phenotype,
  dosageMg,
  onSelectDrug,
  onToggleSpecies,
  onSelectPhenotype,
  onSetQuickDose,
  onOpenReport,
  onOpenSpeciesModal
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 h-14 px-4 flex items-center justify-between bg-slate-950/90 border-b border-white/10 backdrop-blur-md text-xs select-none">
      {/* Brand & Studio Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-white/10 text-cyan-400">
          <Activity className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm tracking-tight text-white">
              InSilico-3D
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 font-mono font-semibold border border-cyan-500/30">
              CLINICAL TWIN
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-normal">
            Multi-Organ Pharmacokinetics & Toxicology
          </div>
        </div>
      </div>

      {/* Center: Drug Selector & Species */}
      <div className="flex items-center space-x-2.5">
        {/* Drug Pills */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-white/10">
          <FlaskConical className="w-3.5 h-3.5 text-cyan-400 ml-2 mr-1 opacity-70" />
          <div className="flex space-x-0.5">
            {BENCHMARK_DRUGS.map((d) => {
              const active = d.id === selectedDrug.id;
              return (
                <button
                  key={d.id}
                  onClick={() => onSelectDrug(d)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    active
                      ? 'bg-slate-800 text-white font-semibold border border-white/15'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                  title={`${d.name} (${d.properties.formula})`}
                >
                  {d.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Species Switcher: Human 70kg vs Rodent 20g */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-white/10">
          <button
            onClick={() => onToggleSpecies('human')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              species === 'human'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Human (70 kg)
          </button>
          <button
            onClick={() => onToggleSpecies('rodent')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              species === 'rodent'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Preclinical mouse allometric scaling"
          >
            Rodent (20 g)
          </button>
        </div>

        {/* Phenotype Selector */}
        <div className="relative">
          <select
            value={phenotype}
            onChange={(e) => onSelectPhenotype(e.target.value as PatientPhenotype)}
            className="appearance-none bg-slate-900 border border-white/10 text-slate-300 text-[11px] font-medium rounded-lg px-2.5 py-1 pr-6 hover:border-white/20 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="healthy_adult">Healthy Adult</option>
            <option value="elderly">Geriatric (Age 75+)</option>
            <option value="renal_impaired">Renal Impaired (eGFR 30)</option>
            <option value="poor_cyp_metabolizer">Poor CYP Metabolizer</option>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
        </div>
      </div>

      {/* Right Actions: Comparison & Report */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenSpeciesModal}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 hover:text-white font-medium text-[11px] transition-colors"
          title="Compare Human vs Mouse PK to evaluate preclinical translation"
        >
          <Scale className="w-3.5 h-3.5 text-amber-400" />
          <span>Species Discordance</span>
        </button>

        <button
          onClick={onOpenReport}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-semibold text-[11px] transition-colors"
          title="Export clinical ADME & safety assessment report"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Clinical Dossier</span>
        </button>
      </div>
    </header>
  );
};
