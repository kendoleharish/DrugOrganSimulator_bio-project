import React, { useState } from 'react';
import {
  Pill,
  AlertTriangle,
  ShieldCheck,
  User,
  Dna,
  Clock,
  Sparkles,
  Sliders,
  Users,
  CheckCircle2,
  X,
} from 'lucide-react';
import { BENCHMARK_DRUGS } from '../../engine/drugs_dataset';
import { DrugProfile, PatientPhenotype, Species } from '../../engine/types';

interface DrugAndDoseSelectorProps {
  selectedDrug: DrugProfile;
  onSelectDrug: (drug: DrugProfile) => void;
  dosageMg: number;
  onChangeDosage: (dose: number) => void;
  species: Species;
  onChangeSpecies: (species: Species) => void;
  phenotype: PatientPhenotype;
  onChangePhenotype: (phenotype: PatientPhenotype) => void;
  dosingIntervalHours: number;
  onChangeDosingInterval: (interval: number) => void;
  onApplyPreset: (drugId: string, dose: number, species?: Species, phenotype?: PatientPhenotype) => void;
  onClose?: () => void;
}

type TabKey = 'scenarios' | 'dosing' | 'cohort';

export const DrugAndDoseSelector: React.FC<DrugAndDoseSelectorProps> = ({
  selectedDrug,
  onSelectDrug,
  dosageMg,
  onChangeDosage,
  species,
  onChangeSpecies,
  phenotype,
  onChangePhenotype,
  dosingIntervalHours,
  onChangeDosingInterval,
  onApplyPreset,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('scenarios');

  const isOverdose = dosageMg > selectedDrug.maxDailySafeDoseMg;
  const safetyRatio = (dosageMg / selectedDrug.maxDailySafeDoseMg) * 100;

  const quickPresets: {
    label: string;
    sublabel: string;
    drugId: string;
    dose: number;
    species?: Species;
    phenotype?: PatientPhenotype;
    danger: boolean;
    tag: string;
  }[] = [
    {
      label: 'Paracetamol 500mg',
      sublabel: 'Normal Pain Relief (1 pill) — Safe for liver',
      drugId: 'paracetamol',
      dose: 500,
      species: 'human',
      danger: false,
      tag: 'Normal Dose',
    },
    {
      label: 'Paracetamol 4000mg',
      sublabel: 'Dangerous Overdose (8 pills) — Overwhelms liver shield',
      drugId: 'paracetamol',
      dose: 4000,
      species: 'human',
      danger: true,
      tag: 'Dangerous Overdose',
    },
    {
      label: 'Human vs. Mouse Test',
      sublabel: 'Mouse Model 2000mg — Mouse cleans it 7x faster, hiding human danger!',
      drugId: 'paracetamol',
      dose: 2000,
      species: 'rodent',
      danger: false,
      tag: 'Mouse Test',
    },
    {
      label: 'Ibuprofen 400mg',
      sublabel: 'Normal Anti-Inflammatory (2 pills) — Safe dose',
      drugId: 'ibuprofen',
      dose: 400,
      species: 'human',
      danger: false,
      tag: 'Normal Dose',
    },
    {
      label: 'Ibuprofen 2400mg',
      sublabel: 'High Dose Ibuprofen — Strains kidney filters and backs up into blood',
      drugId: 'ibuprofen',
      dose: 2400,
      species: 'human',
      danger: true,
      tag: 'Kidney Strain',
    },
    {
      label: 'Caffeine 800mg',
      sublabel: 'Excessive Caffeine (8 energy drinks) — Rapid heart rate & jittery brain',
      drugId: 'caffeine',
      dose: 800,
      species: 'human',
      danger: true,
      tag: 'Heart & Brain',
    },
    {
      label: 'Doxorubicin 60mg',
      sublabel: 'Cancer Chemotherapy — Checks if strong drug strains heart muscle',
      drugId: 'doxorubicin',
      dose: 60,
      species: 'human',
      danger: true,
      tag: 'Heart Check',
    },
  ];

  const handleStepDose = (delta: number) => {
    const minDose = 10;
    const maxDose = selectedDrug.maxDailySafeDoseMg * 2;
    const updated = Math.min(Math.max(dosageMg + delta, minDose), maxDose);
    onChangeDosage(updated);
  };

  return (
    <div className="glass-minimal rounded-xl p-4 flex flex-col gap-3.5 text-neutral-100 shadow-xl">
      {/* Header with Title and Collapse Button */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-cyan-400">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold tracking-wider uppercase text-neutral-200">
              Select a Medicine & Amount (mg)
            </h2>
            <div className="text-[10px] text-neutral-400 font-mono">Normal Dose vs. Dangerous Overdose</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOverdose ? (
            <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              DANGEROUS OVERDOSE ⚠️
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              SAFE NORMAL DOSE ✅
            </span>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
              title="Collapse Panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-black/40 border border-white/[0.06]">
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`py-1.5 px-2 rounded-md text-[11px] font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'scenarios'
              ? 'bg-white/[0.12] text-white font-medium border border-white/10'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Quick Tests</span>
        </button>

        <button
          onClick={() => setActiveTab('dosing')}
          className={`py-1.5 px-2 rounded-md text-[11px] font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'dosing'
              ? 'bg-white/[0.12] text-white font-medium border border-white/10'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sliders className="w-3 h-3 text-cyan-400" />
          <span>Custom Dose</span>
        </button>

        <button
          onClick={() => setActiveTab('cohort')}
          className={`py-1.5 px-2 rounded-md text-[11px] font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'cohort'
              ? 'bg-white/[0.12] text-white font-medium border border-white/10'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Users className="w-3 h-3 text-cyan-400" />
          <span>Human vs. Mouse Test</span>
        </button>
      </div>

      {/* Tab 1: Quick Pre-Engineered Tests */}
      {activeTab === 'scenarios' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Pick an Instant Scenario:</span>
            <span className="text-cyan-400 text-[10px]">Click to test</span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-0.5">
            {quickPresets.map((p, idx) => {
              const isCurrent =
                selectedDrug.id === p.drugId &&
                dosageMg === p.dose &&
                (p.species ? species === p.species : species === 'human');

              return (
                <button
                  key={idx}
                  onClick={() =>
                    onApplyPreset(p.drugId, p.dose, p.species || 'human', p.phenotype || 'healthy_adult')
                  }
                  className={`text-left p-2.5 rounded-lg transition-all flex items-center justify-between group cursor-pointer border ${
                    isCurrent
                      ? 'bg-cyan-500/[0.08] border-cyan-500/30 text-white'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/20 text-neutral-300'
                  }`}
                >
                  <div className="flex flex-col gap-0.5 truncate pr-2">
                    <div className="font-medium text-[11px] flex items-center gap-1.5 text-neutral-200">
                      <span>{p.label}</span>
                      {isCurrent && <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate leading-tight font-sans">
                      {p.sublabel}
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-medium shrink-0 uppercase tracking-wide border ${
                      p.danger
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {p.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Custom Dosing & Regimen */}
      {activeTab === 'dosing' && (
        <div className="flex flex-col gap-3">
          {/* Chemical Agent Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
              Choose Medicine
            </label>
            <div className="well-minimal p-1">
              <select
                value={selectedDrug.id}
                onChange={(e) => {
                  const found = BENCHMARK_DRUGS.find((d) => d.id === e.target.value);
                  if (found) {
                    onSelectDrug(found);
                    onChangeDosage(found.standardDoseMg);
                  }
                }}
                className="w-full bg-transparent border-none rounded px-2 py-1 text-xs font-mono text-neutral-200 focus:outline-none cursor-pointer"
              >
                {BENCHMARK_DRUGS.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#09090b] text-neutral-200">
                    {d.name} — Normal: {d.standardDoseMg}mg (Safe up to: {d.maxDailySafeDoseMg}mg)
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-neutral-400 leading-relaxed italic px-1">
              {selectedDrug.description}
            </p>
          </div>

          {/* Dose Stepper & Range Slider */}
          <div className="card-minimal p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-neutral-400 uppercase text-[10px] tracking-wider">
                Select Amount (mg)
              </span>
              <div className="flex items-center gap-1">
                <span className={`font-mono font-bold text-base ${isOverdose ? 'text-rose-400' : 'text-neutral-100'}`}>
                  {dosageMg}
                </span>
                <span className="text-neutral-500 text-xs">mg</span>
              </div>
            </div>

            {/* Range Slider */}
            <input
              type="range"
              min={10}
              max={selectedDrug.maxDailySafeDoseMg * 2}
              step={10}
              value={dosageMg}
              onChange={(e) => onChangeDosage(parseInt(e.target.value, 10))}
              className="w-full my-1"
            />

            {/* Quick +/- Step Buttons */}
            <div className="flex items-center justify-between gap-1 pt-0.5">
              {[-100, -10, +10, +100].map((step) => (
                <button
                  key={step}
                  onClick={() => handleStepDose(step)}
                  className="flex-1 py-1 px-1 rounded-md text-[10px] font-mono btn-secondary-minimal cursor-pointer font-medium"
                >
                  {step > 0 ? `+${step}mg` : `${step}mg`}
                </button>
              ))}
            </div>

            <div className="flex justify-between text-[10px] font-mono text-neutral-500 pt-0.5">
              <span>Min: 10mg</span>
              <span className="text-amber-400/80">Normal Safe Limit: {selectedDrug.maxDailySafeDoseMg}mg</span>
              <span>Max: {selectedDrug.maxDailySafeDoseMg * 2}mg</span>
            </div>
          </div>

          {/* Regimen (Single Bolus vs Repeated Q8H / Q12H / Q24H) */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 uppercase">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-cyan-400" />
                How Often is it Taken?
              </span>
              <span className="text-cyan-400 font-mono font-medium">
                {dosingIntervalHours === 0 ? 'Single Dose' : `Every ${dosingIntervalHours} Hours`}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 well-minimal p-1">
              {[
                { label: 'Single', value: 0 },
                { label: 'Every 8h', value: 8 },
                { label: 'Every 12h', value: 12 },
                { label: 'Once a Day', value: 24 },
              ].map((reg) => (
                <button
                  key={reg.value}
                  onClick={() => onChangeDosingInterval(reg.value)}
                  className={`py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${
                    dosingIntervalHours === reg.value
                      ? 'bg-white/[0.12] text-white font-medium border border-white/10'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {reg.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Patient Cohort & Species Selection */}
      {activeTab === 'cohort' && (
        <div className="flex flex-col gap-3">
          {/* Patient Phenotype */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-neutral-400 flex items-center gap-1.5 uppercase tracking-wider">
              <User className="w-3 h-3 text-cyan-400" />
              Who is taking the medicine?
            </label>
            <div className="well-minimal p-1">
              <select
                value={phenotype}
                onChange={(e) => onChangePhenotype(e.target.value as PatientPhenotype)}
                className="w-full bg-transparent border-none rounded px-2 py-1 text-xs font-mono text-neutral-200 focus:outline-none cursor-pointer"
              >
                <option value="healthy_adult" className="bg-[#09090b]">Healthy Adult (Standard 70kg Body)</option>
                <option value="poor_cyp_metabolizer" className="bg-[#09090b]">Sensitive Liver (Slower at neutralizing drugs)</option>
                <option value="renal_impaired" className="bg-[#09090b]">Sensitive Kidneys (Slower at filtering into urine)</option>
                <option value="elderly" className="bg-[#09090b]">Senior Citizen (Gentler organ filtering speeds)</option>
              </select>
            </div>
          </div>

          {/* Biological Species Model */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-neutral-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Dna className="w-3 h-3 text-cyan-400" />
              Human vs. Mouse Test
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onChangeSpecies('human')}
                className={`p-2 rounded-lg text-xs font-mono transition-all text-left flex flex-col gap-0.5 cursor-pointer border ${
                  species === 'human'
                    ? 'bg-cyan-500/[0.08] border-cyan-500/30 text-white'
                    : 'bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white'
                }`}
              >
                <span className="font-medium text-neutral-200">Human Body</span>
                <span className="text-[9px] text-neutral-500">Standard human body</span>
              </button>

              <button
                onClick={() => onChangeSpecies('rodent')}
                className={`p-2 rounded-lg text-xs font-mono transition-all text-left flex flex-col gap-0.5 cursor-pointer border ${
                  species === 'rodent'
                    ? 'bg-purple-500/[0.1] border-purple-500/30 text-purple-200'
                    : 'bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white'
                }`}
                title="Mice clean medicine 6.8x faster per kg, hiding human danger!"
              >
                <span className="font-medium text-neutral-200">Mouse Body</span>
                <span className="text-[9px] text-purple-400 font-mono">Cleans 7x faster per kg</span>
              </button>
            </div>
          </div>

          {/* Translation Note */}
          <div className="p-2.5 rounded-lg bg-purple-500/[0.06] border border-purple-500/20 text-[10px] font-mono text-purple-300 leading-relaxed">
            <strong className="text-purple-200 block mb-0.5">The Big Problem:</strong>
            90% of medicines that seem safe in mice fail in humans because mouse bodies are very different. A mouse can easily survive a huge dose that would send a human to the hospital!
          </div>
        </div>
      )}

      {/* Persistent Safety Summary Footer */}
      <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <span>Safety Level:</span>
          <span
            className={`font-semibold ${
              safetyRatio > 100
                ? 'text-rose-400'
                : safetyRatio > 70
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {safetyRatio.toFixed(0)}% of Safe Limit
          </span>
        </div>

        <div className="text-[10px] text-neutral-500">
          {species === 'human' ? 'Human Body' : 'Mouse Model'} • {dosingIntervalHours > 0 ? `Every ${dosingIntervalHours}h` : 'Single Dose'}
        </div>
      </div>
    </div>
  );
};
