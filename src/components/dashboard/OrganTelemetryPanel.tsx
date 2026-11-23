import React, { useState } from 'react';
import {
  Brain,
  Heart,
  Activity,
  Crosshair,
  Layers,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  GitFork,
  Gauge,
  FlaskConical,
  X,
  Target,
} from 'lucide-react';
import { OrganId, CameraPreset } from '../../types/visualizer';
import { OrganState, SimulationResult, SimulationTimeStep } from '../../engine/types';

interface OrganTelemetryPanelProps {
  currentStep: SimulationTimeStep;
  result: SimulationResult;
  selectedOrgan: OrganId | null;
  onSelectOrgan: (id: OrganId) => void;
  onFocusCamera: (preset: CameraPreset) => void;
  onClose?: () => void;
}

type TelemetryTab = 'overview' | 'metabolite' | 'cascade';

export const OrganTelemetryPanel: React.FC<OrganTelemetryPanelProps> = ({
  currentStep,
  result,
  selectedOrgan,
  onSelectOrgan,
  onFocusCamera,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TelemetryTab>('overview');

  const organs = currentStep?.organs;
  const ml = result?.mlPrediction;
  const drug = result?.drug;

  const organList: {
    id: OrganId;
    name: string;
    simpleRole: string;
    icon: React.ReactNode;
    state: OrganState;
    cameraPreset: CameraPreset;
    highlightInfo: string;
  }[] = [
    {
      id: 'liver',
      name: 'Liver',
      simpleRole: 'Liver Safety Shield (Glutathione) — Safe doses are neutralized safely; overdoses overwhelm the liver.',
      icon: <Crosshair className="w-4 h-4" />,
      state: organs?.liver,
      cameraPreset: 'liver',
      highlightInfo: `Safety Shield: ${organs?.liver?.glutathioneReservePct?.toFixed(0)}% • Toxic Poison: ${
        (organs?.liver?.activeMetaboliteLevel ?? 0) > 0 ? 'ACCUMULATING ⚠️' : '0 (Safe)'
      }`,
    },
    {
      id: 'kidneys',
      name: 'Kidneys',
      simpleRole: 'Kidney Blood Filter — Cleans the medicine out of your blood into urine.',
      icon: <Layers className="w-4 h-4" />,
      state: organs?.kidneys,
      cameraPreset: 'kidneys',
      highlightInfo: `Blood Filtering Speed: ${organs?.kidneys?.filtrationEfficiencyPct?.toFixed(0)}% of Normal`,
    },
    {
      id: 'heart',
      name: 'Heart',
      simpleRole: 'Heart Rate & Rhythm — Checks if the medicine causes dangerous irregular heartbeats.',
      icon: <Heart className="w-4 h-4" />,
      state: organs?.heart,
      cameraPreset: 'heart',
      highlightInfo: `Irregular Beat Risk: ${ml?.cardiotoxicityProb}%`,
    },
    {
      id: 'brain',
      name: 'Brain & Head',
      simpleRole: 'Brain & Head — Checks if the medicine crosses into the brain causing sleepiness or headaches.',
      icon: <Brain className="w-4 h-4" />,
      state: organs?.brain,
      cameraPreset: 'brain',
      highlightInfo: `Brain Entry Risk: ${ml?.neurotoxicityProb}% • ${drug?.properties.logP && drug.properties.logP > 1.2 ? 'Crosses into brain' : 'Protected'}`,
    },
    {
      id: 'stomach',
      name: 'Stomach & Gut',
      simpleRole: 'Stomach & Gut — Where the pill dissolves and enters the bloodstream.',
      icon: <Activity className="w-4 h-4" />,
      state: organs?.stomach,
      cameraPreset: 'stomach',
      highlightInfo: `Pill Dissolving in Stomach: ${(currentStep?.gutAmountMg ?? 0).toFixed(1)} mg left`,
    },
  ];

  const activeOrgan = organList.find((o) => o.id === selectedOrgan) || organList[0];
  const activeState = activeOrgan?.state;
  const isCascade = currentStep?.crossTalkInterference ?? false;
  const gsh = organs?.liver?.glutathioneReservePct ?? 100;
  const napqi = organs?.liver?.activeMetaboliteLevel ?? 0;
  const egfr = organs?.kidneys?.filtrationEfficiencyPct ?? 100;

  // Simple Plain-English breakdown of how the medicine is neutralized
  const metaboliteRoutes = React.useMemo(() => {
    if (drug?.id === 'paracetamol') {
      const isOverdose = (result?.dosageMg ?? 500) > 2000;
      return [
        {
          name: 'Safe Urine Route (Main Pathway)',
          share: isOverdose ? '42%' : '55%',
          type: 'safe',
          desc: 'The liver safely packages the medicine to be washed out harmlessly in urine.',
        },
        {
          name: 'Safe Breakdown Route (Backup)',
          share: isOverdose ? '18%' : '30%',
          type: 'safe',
          desc: 'Normal liver enzymes safely neutralize the medicine at normal doses.',
        },
        {
          name: 'Toxic Breakdown Chemical (NAPQI)',
          share: isOverdose ? '32%' : '10%',
          type: 'toxic',
          desc: 'A harmful chemical created during digestion. At safe doses, the liver shield destroys it instantly. In overdoses, it attacks liver cells!',
        },
        {
          name: 'Direct Kidney Filtering',
          share: isOverdose ? '8%' : '5%',
          type: 'neutral',
          desc: 'Medicine filtered directly by the kidneys into urine without needing liver changes.',
        },
      ];
    } else if (drug?.id === 'ibuprofen') {
      return [
        {
          name: 'Safe Liver Neutralization',
          share: '60%',
          type: 'safe',
          desc: 'Liver disarms the medicine into harmless components.',
        },
        {
          name: 'Gentle Breakdown Product',
          share: '25%',
          type: 'safe',
          desc: 'Broken down safely into inactive compounds.',
        },
        {
          name: 'Kidney Urine Filter Route',
          share: '15%',
          type: 'neutral',
          desc: 'Passed out through the kidney blood filter.',
        },
      ];
    } else {
      return [
        {
          name: 'Safe Liver Enzyme Clearance',
          share: '70%',
          type: 'safe',
          desc: 'Liver enzymes safely break down and disarm the medicine.',
        },
        {
          name: 'Direct Kidney Blood Filter',
          share: '30%',
          type: 'neutral',
          desc: 'Cleaned directly from the blood into urine by the kidneys.',
        },
      ];
    }
  }, [drug?.id, result?.dosageMg]);

  return (
    <div className="glass-minimal rounded-xl p-4 flex flex-col gap-3.5 text-neutral-100 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-cyan-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold tracking-wider uppercase text-neutral-200">
              Organ Health & Safety
            </h2>
            <div className="text-[10px] text-neutral-400 font-mono">Live sensors inside the virtual body</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCascade ? (
            <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              CHAIN REACTION ⚠️
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              ALL ORGANS HEALTHY ✅
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

      {/* Systemic Alert Banner in Plain Language */}
      {currentStep?.systemicAlert && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-mono">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
          <div className="leading-snug text-[11px] font-medium">{currentStep.systemicAlert}</div>
        </div>
      )}

      {/* Segmented Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-black/40 border border-white/[0.06]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-1.5 px-2 rounded-md text-[11px] font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white/[0.12] text-white font-medium border border-white/10'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers className="w-3 h-3 text-cyan-400" />
          <span>Vital Organs</span>
        </button>

        <button
          onClick={() => setActiveTab('metabolite')}
          className={`py-1.5 px-2 rounded-md text-[11px] font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'metabolite'
              ? 'bg-white/[0.12] text-white font-medium border border-white/10'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FlaskConical className="w-3 h-3 text-cyan-400" />
          <span>Liver Shield</span>
        </button>

        <button
          onClick={() => setActiveTab('cascade')}
          className={`py-1.5 px-2 rounded-md text-[11px] font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'cascade'
              ? 'bg-white/[0.12] text-white font-medium border border-white/10'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <GitFork className="w-3 h-3 text-cyan-400" />
          <span>Body Reaction</span>
        </button>
      </div>

      {/* Tab 1: Overview & Vital Organs */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-2.5">
          {/* Organ Matrix Grid */}
          <div className="flex flex-col gap-1 max-h-[170px] overflow-y-auto pr-0.5">
            {organList.map((item) => {
              const isSelected = selectedOrgan === item.id;
              const stress = item.state?.stressLevel ?? 0;
              const isToxic = item.state?.colorState === 'toxic';
              const isStressed = item.state?.colorState === 'stressed';

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectOrgan(item.id);
                    onFocusCamera(item.cameraPreset);
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg transition-all group cursor-pointer border ${
                    isSelected
                      ? 'bg-cyan-500/[0.08] border-cyan-500/30 text-white'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/20 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-md ${
                        isToxic
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : isStressed
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-xs text-neutral-200 flex items-center gap-1.5">
                        <span>{item.name}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {(item.state?.concentration ?? 0).toFixed(2)} mg/L in tissue
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stress Meter */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-mono font-medium text-xs ${
                        isToxic
                          ? 'text-rose-400'
                          : isStressed
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {isToxic ? 'OVERLOADED' : isStressed ? 'STRESSED' : 'HEALTHY'} ({(stress * 100).toFixed(0)}%)
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Selected Organ Card */}
          {activeOrgan && (
            <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-md bg-white/[0.06] text-cyan-400 border border-white/[0.08]">
                    {activeOrgan.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-200 font-mono tracking-wide">
                      {activeOrgan.name.toUpperCase()} MONITOR
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => onFocusCamera(activeOrgan.cameraPreset)}
                  className="btn-secondary-minimal px-2 py-0.5 text-[10px] font-mono text-cyan-400 flex items-center gap-1"
                >
                  <Target className="w-3 h-3" /> Look in 3D
                </button>
              </div>

              {/* Simple Role Explanation */}
              <p className="text-[10px] text-neutral-400 leading-relaxed font-sans px-0.5">
                {activeOrgan.simpleRole}
              </p>

              {/* Biomarkers Grid */}
              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                <div className="card-minimal p-2">
                  <span className="text-[9px] text-neutral-500 block uppercase tracking-wider">
                    Medicine in Organ
                  </span>
                  <span className="text-sm font-semibold text-neutral-200">
                    {(activeState?.concentration ?? 0).toFixed(2)} mg/L
                  </span>
                </div>

                <div className="card-minimal p-2">
                  <span className="text-[9px] text-neutral-500 block uppercase tracking-wider">
                    Organ Stress Level
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      (activeState?.stressLevel ?? 0) > 0.6
                        ? 'text-rose-400'
                        : (activeState?.stressLevel ?? 0) > 0.3
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {((activeState?.stressLevel ?? 0) * 100).toFixed(0)}%
                  </span>
                </div>

                {activeOrgan.id === 'liver' && (
                  <>
                    <div className="card-minimal p-2">
                      <span className="text-[9px] text-neutral-500 block uppercase tracking-wider">
                        Liver Safety Shield (GSH)
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          gsh < 30 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                        }`}
                      >
                        {gsh.toFixed(0)}% {gsh < 30 ? '(OVERWHELMED ⚠️)' : '(SAFE)'}
                      </span>
                    </div>
                    <div className="card-minimal p-2">
                      <span className="text-[9px] text-neutral-500 block uppercase tracking-wider">
                        Toxic Poison (NAPQI)
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          napqi > 0 ? 'text-rose-400 animate-pulse' : 'text-neutral-500'
                        }`}
                      >
                        {napqi > 0 ? `${napqi.toFixed(1)} mg (Harmful!)` : '0.0 mg (None)'}
                      </span>
                    </div>
                  </>
                )}

                {activeOrgan.id === 'kidneys' && (
                  <div className="card-minimal p-2 col-span-2">
                    <span className="text-[9px] text-neutral-500 block uppercase tracking-wider">
                      Blood Filtering Speed
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        egfr < 40 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {egfr.toFixed(0)}% of Normal Speed {egfr < 40 ? '— Filter Clogged!' : '— Filtering Safely'}
                    </span>
                  </div>
                )}

                {activeOrgan.id === 'heart' && (
                  <div className="card-minimal p-2 col-span-2">
                    <span className="text-[9px] text-neutral-500 block uppercase tracking-wider">
                      Heart Rate & Rhythm Check
                    </span>
                    <span className={`text-sm font-semibold ${ml?.cardiotoxicityProb && ml.cardiotoxicityProb > 45 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {ml?.cardiotoxicityProb}% Irregular Heartbeat Risk
                    </span>
                  </div>
                )}

                {activeOrgan.id === 'brain' && (
                  <div className="card-minimal p-2 col-span-2">
                    <span className="text-[9px] text-neutral-500 block uppercase tracking-wider">
                      Brain Entry & Headache/Sleepiness Risk
                    </span>
                    <span className="text-sm font-semibold text-cyan-400">
                      {ml?.neurotoxicityProb}% Brain Crossing Chance
                    </span>
                  </div>
                )}

                {activeOrgan.id === 'stomach' && (
                  <div className="card-minimal p-2 col-span-2">
                    <span className="text-[9px] text-neutral-500 block uppercase tracking-wider">
                      Pill Dissolving in Stomach
                    </span>
                    <span className="text-sm font-semibold text-amber-400">
                      {(currentStep?.gutAmountMg ?? 0).toFixed(1)} mg left to absorb
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Liver Safety Shield (Glutathione) */}
      {activeTab === 'metabolite' && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>How the Liver Handles This Medicine</span>
            <span className="text-cyan-400">{drug?.name}</span>
          </div>

          {/* Metabolic Pathways List */}
          <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-0.5">
            {metaboliteRoutes.map((m, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg card-minimal flex flex-col gap-0.5 text-[11px] font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-200">{m.name}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                      m.type === 'toxic'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {m.share}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 leading-tight font-sans">{m.desc}</div>
              </div>
            ))}
          </div>

          {/* Liver Safety Shield (Glutathione) Gauge */}
          <div className="p-2.5 rounded-lg card-minimal flex flex-col gap-1.5 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 text-[10px] uppercase tracking-wider">
                Liver Safety Shield (Glutathione)
              </span>
              <span
                className={`font-semibold text-xs ${
                  gsh < 30 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                }`}
              >
                {gsh.toFixed(0)}% {gsh < 30 ? '(OVERWHELMED)' : '(PROTECTING)'}
              </span>
            </div>

            {/* Gauge Bar with 30% Threshold Marker */}
            <div className="relative w-full h-2 bg-white/[0.08] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  gsh < 30
                    ? 'bg-rose-500'
                    : gsh < 60
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(Math.max(gsh, 0), 100)}%` }}
              />
              {/* 30% Critical Marker Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10"
                style={{ left: '30%' }}
                title="Danger line: Liver shield exhausted (30%)"
              />
            </div>

            <div className="flex justify-between text-[9px] text-neutral-500">
              <span className="text-rose-400">0% (Liver Damage)</span>
              <span className="text-amber-400">30% Danger Line</span>
              <span className="text-emerald-400">100% (Full Shield)</span>
            </div>
          </div>

          {/* Friendly Everyday Explanation */}
          <div className="p-2.5 rounded-lg bg-sky-500/[0.06] border border-sky-500/20 text-[10px] font-mono text-sky-200 leading-relaxed font-sans">
            <strong className="text-sky-100 block mb-0.5 font-mono">How the Shield Works:</strong>
            Your liver has a natural shield (Glutathione). Safe doses are neutralized safely. But if you take a dangerous overdose, the shield gets completely drained (drops below 30%) and toxic poison builds up, injuring liver cells.
          </div>
        </div>
      )}

      {/* Tab 3: Body Chain Reaction */}
      {activeTab === 'cascade' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Organ-to-Organ Domino Effect</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase border ${
                isCascade
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {isCascade ? 'CHAIN REACTION ACTIVE ⚠️' : 'ALL ORGANS STABLE ✅'}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 card-minimal p-2.5 text-[11px] font-mono">
            {/* Step 1 */}
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
              <span className="text-neutral-300 flex items-center gap-1.5 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                1. Pill dissolves in stomach & enters blood
              </span>
              <span className="text-emerald-400 text-[10px] font-mono">Active</span>
            </div>

            {/* Step 2 */}
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
              <span className="text-neutral-300 flex items-center gap-1.5 font-sans">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    gsh < 30 ? 'bg-rose-400 animate-ping' : 'bg-neutral-600'
                  }`}
                />
                2. Liver Safety Shield holds against medicine
              </span>
              <span
                className={`text-[10px] font-mono ${
                  gsh < 30 ? 'text-rose-400 font-semibold' : 'text-neutral-500'
                }`}
              >
                {gsh < 30 ? 'OVERWHELMED (<30%)' : 'Shield Strong'}
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
              <span className="text-neutral-300 flex items-center gap-1.5 font-sans">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isCascade ? 'bg-rose-400 animate-ping' : 'bg-neutral-600'
                  }`}
                />
                3. Kidneys filter waste into urine
              </span>
              <span
                className={`text-[10px] font-mono ${
                  isCascade ? 'text-rose-400 font-semibold' : 'text-neutral-500'
                }`}
              >
                {isCascade ? `SLOWED (${egfr.toFixed(0)}%)` : 'Normal Filtering'}
              </span>
            </div>

            {/* Step 4 */}
            <div className="flex items-center justify-between">
              <span className="text-neutral-300 flex items-center gap-1.5 font-sans">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isCascade ? 'bg-amber-400 animate-ping' : 'bg-neutral-600'
                  }`}
                />
                4. Medicine backs up in blood & strains heart
              </span>
              <span
                className={`text-[10px] font-mono ${
                  isCascade ? 'text-amber-400 font-semibold' : 'text-neutral-500'
                }`}
              >
                {isCascade ? 'Heart Strained' : 'Normal Beat'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-500/[0.06] border border-amber-500/20 text-[10px] font-mono text-amber-200 leading-relaxed font-sans">
            <span className="text-amber-100 font-medium block mb-0.5 font-mono">Why Organs React Together:</span>
            In a real human body, organs are connected by your bloodstream. If your kidneys get overwhelmed and slow down, medicine cannot escape into urine. It builds up in the blood, stressing both your heart and liver!
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-neutral-400">
        <span>Medicine in Bloodstream:</span>
        <span className="text-neutral-200 font-medium">
          {(currentStep?.plasmaConcentrationMgL ?? 0).toFixed(2)} mg in each Liter
        </span>
      </div>
    </div>
  );
};
