import React from 'react';
import {
  Activity,
  ShieldAlert,
  Sparkles,
  SlidersHorizontal,
  BarChart3,
  ArrowLeft,
} from 'lucide-react';

interface HeaderBarProps {
  crossTalkInterference?: boolean;
  systemicAlert?: string;
  showLeftPanel: boolean;
  onToggleLeftPanel: () => void;
  showRightPanel: boolean;
  onToggleRightPanel: () => void;
  onBackToOverview?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  crossTalkInterference = false,
  systemicAlert,
  showLeftPanel,
  onToggleLeftPanel,
  showRightPanel,
  onToggleRightPanel,
  onBackToOverview,
}) => {
  return (
    <header className="relative w-full h-11 glass-minimal border-b border-white/[0.08] px-3 md:px-5 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand & Left Navigation */}
      <div className="flex items-center gap-2.5">
        {onBackToOverview && (
          <button
            onClick={onBackToOverview}
            className="btn-secondary-minimal px-2.5 py-1 text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 hover:text-white"
            title="Return to Overview & Case Studies"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Overview</span>
          </button>
        )}

        <button
          onClick={onToggleLeftPanel}
          className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
            showLeftPanel
              ? 'bg-white/[0.12] border-white/20 text-white font-medium'
              : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.06]'
          }`}
          title={showLeftPanel ? 'Collapse Dosing & Setup' : 'Open Dosing & Setup'}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-300" />
          <span className="hidden md:inline text-[11px]">Dosing & Setup</span>
        </button>

        <div className="flex items-center gap-2 pl-1 border-l border-white/[0.08] ml-1">
          <div className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-cyan-400 shrink-0">
            <Activity className="w-3.5 h-3.5" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold tracking-tight text-white font-sans">
              InSilico
            </span>
            <span className="bg-white text-black font-mono font-bold text-[10px] px-1.5 py-0.5 rounded">
              3D
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-cyan-300 hidden lg:inline">
              Virtual Human Body
            </span>
          </div>
        </div>
      </div>

      {/* Center Subtitle (Friendly Plain-English Tagline) */}
      <div className="hidden xl:flex items-center text-[11px] text-neutral-300 font-mono px-3 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2 animate-pulse" />
        <span>InSilico-3D: Test Medicines on a Virtual Human Body Instead of Real Animals</span>
      </div>

      {/* Telemetry System Badges & Right Panel Dock Trigger */}
      <div className="flex items-center gap-2 text-xs">
        {crossTalkInterference && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-mono animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="font-semibold hidden sm:inline tracking-wide">ORGAN CHAIN REACTION ⚠️</span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-neutral-300 font-mono text-[11px]">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Real-Time Biology Sim</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline font-medium">60 FPS</span>
        </div>

        <button
          onClick={onToggleRightPanel}
          className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
            showRightPanel
              ? 'bg-white/[0.12] border-white/20 text-white font-medium'
              : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.06]'
          }`}
          title={showRightPanel ? 'Collapse Organ Health' : 'Open Organ Health'}
        >
          <BarChart3 className="w-3.5 h-3.5 text-neutral-300" />
          <span className="hidden md:inline text-[11px]">Organ Health</span>
        </button>
      </div>
    </header>
  );
};
