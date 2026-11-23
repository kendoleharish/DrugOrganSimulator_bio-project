import React, { useState } from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Compass, 
  Shield, 
  Activity, 
  Heart, 
  Zap, 
  ChevronDown, 
  ChevronRight,
  Flame,
  User,
  Wind,
  Droplets,
  Utensils,
  Dna,
  Sparkles
} from 'lucide-react';
import { AnatomySex, PhysiologicalSystem } from '../../types/ui';

interface DissectionControlsProps {
  dissectionDepth: number;
  systemVisibility: Record<PhysiologicalSystem, boolean>;
  sex: AnatomySex;
  stressHeatmapVisible: boolean;
  isolatedKey: string | null;
  onSetDissectionDepth: (depth: number) => void;
  onToggleSystem: (system: PhysiologicalSystem) => void;
  onSetSex: (sex: AnatomySex) => void;
  onToggleStressHeatmap: () => void;
  onSelectViewPreset: (preset: string) => void;
  onClearIsolation: () => void;
}

export const DissectionControls: React.FC<DissectionControlsProps> = ({
  dissectionDepth,
  systemVisibility,
  sex,
  stressHeatmapVisible,
  isolatedKey,
  onSetDissectionDepth,
  onToggleSystem,
  onSetSex,
  onToggleStressHeatmap,
  onSelectViewPreset,
  onClearIsolation
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dissect' | 'systems' | 'views'>('dissect');

  const dissectionPresets = [
    { label: 'Surface Shell', depth: 0, desc: 'External integumentary skin' },
    { label: 'Musculoskeletal', depth: 25, desc: 'Muscles & skeletal framework' },
    { label: 'Skeletal Cage', depth: 45, desc: 'Axial skeleton & protective cage' },
    { label: 'Visceral Organs', depth: 65, desc: 'Internal thoracic & abdominal viscera' },
    { label: 'Cardiopulmonary', depth: 80, desc: 'Heart, great vessels & lungs' },
    { label: 'Deep Neuro-Axial', depth: 95, desc: 'Cranial nerves & central spinal cord' }
  ];

  const systemsList: { id: PhysiologicalSystem; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'skin', label: 'Integumentary Skin', icon: <User className="w-3.5 h-3.5" />, color: '#ecd2be' },
    { id: 'muscles', label: 'Muscular System', icon: <Flame className="w-3.5 h-3.5" />, color: '#b5463d' },
    { id: 'skeleton', label: 'Skeletal Framework', icon: <Shield className="w-3.5 h-3.5" />, color: '#efe6d2' },
    { id: 'nervous', label: 'Nervous System', icon: <Zap className="w-3.5 h-3.5" />, color: '#f2c14e' },
    { id: 'cardiovascular', label: 'Cardiovascular System', icon: <Activity className="w-3.5 h-3.5" />, color: '#ef4444' },
    { id: 'respiratory', label: 'Respiratory System', icon: <Wind className="w-3.5 h-3.5" />, color: '#38bdf8' },
    { id: 'digestive', label: 'Digestive System', icon: <Utensils className="w-3.5 h-3.5" />, color: '#f97316' },
    { id: 'urinary', label: 'Urinary & Renal System', icon: <Droplets className="w-3.5 h-3.5" />, color: '#06b6d4' },
    { id: 'endocrine', label: 'Endocrine & Lymphatic', icon: <Sparkles className="w-3.5 h-3.5" />, color: '#a855f7' },
    { id: 'reproductive', label: 'Reproductive System', icon: <Dna className="w-3.5 h-3.5" />, color: '#ec4899' }
  ];

  const viewpoints = [
    { id: 'anterior', label: 'Anterior' },
    { id: 'posterior', label: 'Posterior' },
    { id: 'lateralLeft', label: 'Lat Left' },
    { id: 'lateralRight', label: 'Lat Right' },
    { id: 'superior', label: 'Cranial' },
    { id: 'thoracic', label: 'Thorax' },
    { id: 'abdominal', label: 'Abdomen' },
    { id: 'pelvic', label: 'Pelvis' },
    { id: 'full', label: 'Full Body' }
  ];

  return (
    <aside 
      aria-label="Anatomical Dissection and Layer Controls"
      className="absolute top-16 left-4 z-20 w-80 max-w-[320px] rounded-xl bg-slate-950/85 border border-white/10 shadow-2xl backdrop-blur-md text-xs select-none transition-all duration-200"
    >
      {/* Deck Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-100 tracking-wide uppercase text-[11px]">
            Anatomical Navigation
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {/* Sex switch */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-white/10 p-0.5 mr-1">
            <button
              onClick={() => onSetSex('male')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                sex === 'male' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Male Anatomical Twin (XY)"
            >
              XY
            </button>
            <button
              onClick={() => onSetSex('female')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                sex === 'female' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Female Anatomical Twin (XX)"
            >
              XX
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3 max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
          {/* Tab Selector: Dissect / Systems / Viewpoints */}
          <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-slate-900 border border-white/10">
            <button
              onClick={() => setActiveTab('dissect')}
              className={`py-1 rounded text-[10px] font-medium transition-all ${
                activeTab === 'dissect' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dissection
            </button>
            <button
              onClick={() => setActiveTab('systems')}
              className={`py-1 rounded text-[10px] font-medium transition-all ${
                activeTab === 'systems' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Systems (10)
            </button>
            <button
              onClick={() => setActiveTab('views')}
              className={`py-1 rounded text-[10px] font-medium transition-all ${
                activeTab === 'views' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cameras
            </button>
          </div>

          {/* TAB 1: Progressive Dissection */}
          {activeTab === 'dissect' && (
            <div className="space-y-3">
              {/* Continuous Depth Scrubber */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-300 font-medium">Progressive Dissection</span>
                  <span className="font-mono text-cyan-400 font-bold">{dissectionDepth}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={dissectionDepth}
                  onChange={(e) => onSetDissectionDepth(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>Skin</span>
                  <span>Muscles</span>
                  <span>Viscera</span>
                  <span>Deep Axis</span>
                </div>
              </div>

              {/* Dissection Quick Milestones */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Anatomical Depth Presets
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {dissectionPresets.map((preset) => {
                    const isCurrent = Math.abs(dissectionDepth - preset.depth) < 8;
                    return (
                      <button
                        key={preset.label}
                        onClick={() => onSetDissectionDepth(preset.depth)}
                        className={`px-2 py-1.5 rounded-lg text-left transition-all ${
                          isCurrent
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-medium'
                            : 'bg-slate-900/60 hover:bg-slate-800 border border-white/5 text-slate-300'
                        }`}
                      >
                        <div className="text-[10px] font-semibold">{preset.label}</div>
                        <div className="text-[8px] text-slate-400 truncate">{preset.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stress Heatmap Toggle */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PK Cellular Stress Tint</span>
                </span>
                <button
                  onClick={onToggleStressHeatmap}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                    stressHeatmapVisible
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border-white/10'
                  }`}
                >
                  {stressHeatmapVisible ? 'ACTIVE' : 'OFF'}
                </button>
              </div>

              {/* Clear Isolation Banner if Active */}
              {isolatedKey && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <span className="text-[10px] text-amber-300 font-medium">
                    Structure Isolated
                  </span>
                  <button
                    onClick={onClearIsolation}
                    className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[9px] font-semibold"
                  >
                    Reset View
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Granular Systems Toggle (All 8+ Physiological Systems) */}
          {activeTab === 'systems' && (
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                <span>Physiological Systems</span>
                <span className="text-[9px] text-cyan-400 font-mono">10 Systems</span>
              </div>
              {systemsList.map((sys) => {
                const isVisible = systemVisibility[sys.id] !== false;
                return (
                  <button
                    key={sys.id}
                    onClick={() => onToggleSystem(sys.id)}
                    className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg border transition-all ${
                      isVisible
                        ? 'bg-slate-900/80 border-white/10 text-slate-200'
                        : 'bg-slate-950/40 border-white/5 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span style={{ color: sys.color }}>{sys.icon}</span>
                      <span className="text-[11px] font-medium">{sys.label}</span>
                    </div>
                    {isVisible ? (
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 3: Anatomical Camera Angles */}
          {activeTab === 'views' && (
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                Standard Viewing Planes
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {viewpoints.map((vp) => (
                  <button
                    key={vp.id}
                    onClick={() => onSelectViewPreset(vp.id)}
                    className="px-2 py-1.5 rounded-lg bg-slate-900/70 hover:bg-slate-800 border border-white/5 text-slate-300 text-[11px] font-medium transition-all text-center flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Compass className="w-3 h-3 text-cyan-400 opacity-70" />
                    <span>{vp.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => onSelectViewPreset('full')}
                  className="w-full py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Standing Stance</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
