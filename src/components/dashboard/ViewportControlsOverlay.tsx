import React from 'react';
import {
  RotateCcw,
  Play,
  Pause,
  Layers,
  Heart,
  Brain,
  Crosshair,
  User,
  Activity,
  Tag,
} from 'lucide-react';
import { CameraPreset, ViewMode } from '../../types/visualizer';

interface ViewportControlsOverlayProps {
  cameraPreset: CameraPreset;
  onSetCameraPreset: (preset: CameraPreset) => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  onResetCamera: () => void;
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
}

export const ViewportControlsOverlay: React.FC<ViewportControlsOverlayProps> = ({
  cameraPreset,
  onSetCameraPreset,
  autoRotate,
  onToggleAutoRotate,
  onResetCamera,
  viewMode,
  onSetViewMode,
  showLabels,
  onToggleLabels,
}) => {
  const presets: { id: CameraPreset; label: string; icon: React.ReactNode }[] = [
    { id: 'body', label: 'Body', icon: <User className="w-3 h-3" /> },
    { id: 'brain', label: 'Brain', icon: <Brain className="w-3 h-3" /> },
    { id: 'heart', label: 'Heart', icon: <Heart className="w-3 h-3" /> },
    { id: 'stomach', label: 'Stomach', icon: <Activity className="w-3 h-3" /> },
    { id: 'liver', label: 'Liver', icon: <Crosshair className="w-3 h-3" /> },
    { id: 'kidneys', label: 'Kidneys', icon: <Layers className="w-3 h-3" /> },
  ];

  const viewModes: { id: ViewMode; label: string }[] = [
    { id: 'composite', label: 'Composite' },
    { id: 'wireframe', label: 'Wire' },
    { id: 'vascular-highlight', label: 'Vascular' },
    { id: 'organs-only', label: 'Organs' },
  ];

  return (
    <div className="h-8 flex items-center gap-1 glass-minimal rounded-full px-2 py-0.5 border border-white/[0.08] select-none text-xs shadow-lg">
      {/* 1. Camera Focus Presets */}
      <div className="flex items-center gap-0.5">
        <span className="text-[10px] font-mono text-neutral-500 px-1 uppercase tracking-wider hidden xl:inline">
          Focus:
        </span>
        {presets.map((p) => {
          const isActive = cameraPreset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSetCameraPreset(p.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                isActive
                  ? 'bg-white/[0.14] text-white font-medium border border-white/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
              }`}
              title={`Focus camera on ${p.label}`}
            >
              {p.icon}
              <span className="hidden sm:inline">{p.label}</span>
            </button>
          );
        })}
      </div>

      <div className="w-px h-3.5 bg-white/[0.08] mx-1 shrink-0" />

      {/* 2. View Modes */}
      <div className="flex items-center gap-0.5 bg-black/40 p-0.5 rounded-full border border-white/[0.06]">
        {viewModes.map((m) => {
          const isActive = viewMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSetViewMode(m.id)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-all cursor-pointer ${
                isActive
                  ? 'bg-white/[0.14] text-white font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="w-px h-3.5 bg-white/[0.08] mx-1 shrink-0" />

      {/* 3. Utility Toggles: Auto-Rotate, Labels, Reset */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onToggleAutoRotate}
          className={`p-1 rounded-full text-xs transition-all cursor-pointer border ${
            autoRotate
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
              : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.04]'
          }`}
          title={autoRotate ? 'Pause 360° Rotation' : 'Enable 360° Rotation'}
        >
          {autoRotate ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>

        <button
          onClick={onToggleLabels}
          className={`p-1 rounded-full text-xs transition-all cursor-pointer border ${
            showLabels
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
              : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.04]'
          }`}
          title="Toggle 3D Floating Organ Badges"
        >
          <Tag className="w-3 h-3" />
        </button>

        <button
          onClick={onResetCamera}
          className="p-1 rounded-full text-xs text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
          title="Reset Camera View to Default"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
