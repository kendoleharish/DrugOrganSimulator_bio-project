import React from 'react';
import { 
  Eye, 
  EyeOff, 
  Layers, 
  Flame, 
  RotateCcw, 
  Activity, 
  Radio, 
  GitCommit,
  Sparkles,
  Shield
} from 'lucide-react';
import { LayerVisibility } from '../../types/ui';

interface LayerControlsProps {
  layers: LayerVisibility;
  onToggleLayer: (layer: keyof LayerVisibility) => void;
  onResetCamera: () => void;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  layers,
  onToggleLayer,
  onResetCamera
}) => {
  return (
    <div className="absolute top-20 left-5 z-20 flex flex-col space-y-1.5 p-2 rounded-2xl glass-panel shadow-2xl border border-cyan-500/20">
      <div className="px-2 py-1 flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-1">
        <span className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1">
          <Layers className="w-3 h-3" />
          <span>3D Layers</span>
        </span>
      </div>

      {/* Skin / Anatomical Shell */}
      <button
        onClick={() => onToggleLayer('skinShell')}
        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
          layers.skinShell
            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
        title="Toggle Translucent Anatomical Shell"
      >
        {layers.skinShell ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
        <span>Body Shell</span>
      </button>

      {/* Skeleton Guide / Ribcage */}
      <button
        onClick={() => onToggleLayer('skeletonGuide')}
        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
          layers.skeletonGuide
            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
        title="Toggle 3D Holographic Skeletal Cage & Spine"
      >
        <Shield className="w-3.5 h-3.5 text-blue-400" />
        <span>Skeleton Guide</span>
      </button>

      {/* Vascular Tree */}
      <button
        onClick={() => onToggleLayer('vascularTree')}
        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
          layers.vascularTree
            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
        title="Toggle Vascular Arterial & Venous Network"
      >
        <GitCommit className="w-3.5 h-3.5 text-rose-400" />
        <span>Vascular Tree</span>
      </button>

      {/* Blood Flow Particles */}
      <button
        onClick={() => onToggleLayer('bloodParticles')}
        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
          layers.bloodParticles
            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
        title="Toggle Flowing Erythrocyte Particles"
      >
        <Activity className="w-3.5 h-3.5 text-rose-400" />
        <span>Blood Flow</span>
      </button>

      {/* Vital Organs */}
      <button
        onClick={() => onToggleLayer('organs')}
        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
          layers.organs
            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
        title="Toggle 3D Vital Organs"
      >
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        <span>Vital Organs</span>
      </button>

      {/* Dynamic Cellular Stress Heatmap */}
      <button
        onClick={() => onToggleLayer('stressHeatmap')}
        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
          layers.stressHeatmap
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
        title="Toggle Dynamic Cellular Stress Glow"
      >
        <Flame className="w-3.5 h-3.5 text-amber-400" />
        <span>Toxicity Glow</span>
      </button>

      {/* Holographic Annotations */}
      <button
        onClick={() => onToggleLayer('holoAnnotations')}
        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
          layers.holoAnnotations
            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
        title="Toggle 3D Holographic Reticles & Telemetry Tags"
      >
        <Radio className="w-3.5 h-3.5 text-cyan-400" />
        <span>Holo Reticles</span>
      </button>

      <div className="pt-1 border-t border-slate-700/60 mt-1">
        <button
          onClick={onResetCamera}
          className="w-full flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all"
          title="Reset Camera Framing to Full Body View"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Frame</span>
        </button>
      </div>
    </div>
  );
};
