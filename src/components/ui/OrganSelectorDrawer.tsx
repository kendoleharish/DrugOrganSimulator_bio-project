import React from 'react';
import { OrganKey, ORGAN_INFO_MAP } from '../../types/ui';
import { SimulationTimeStep } from '../../engine/types';

interface OrganSelectorDrawerProps {
  currentStep: SimulationTimeStep;
  selectedOrgan: OrganKey | null;
  onSelectOrgan: (organ: OrganKey | null) => void;
}

export const OrganSelectorDrawer: React.FC<OrganSelectorDrawerProps> = ({
  currentStep,
  selectedOrgan,
  onSelectOrgan
}) => {
  const organKeys: OrganKey[] = ['brain', 'heart', 'liver', 'stomach', 'kidneys'];

  return (
    <div className="absolute top-20 right-5 z-20 flex flex-col space-y-1.5 p-2 rounded-2xl glass-panel shadow-2xl border border-cyan-500/20 max-w-[240px]">
      <div className="px-2 py-1 flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-1">
        <span className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase">
          Anatomical Focus
        </span>
        {selectedOrgan && (
          <button
            onClick={() => onSelectOrgan(null)}
            className="text-[10px] text-slate-400 hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-col space-y-1">
        {organKeys.map((key) => {
          const info = ORGAN_INFO_MAP[key];
          const state = currentStep.organs[key];
          const isSelected = selectedOrgan === key;
          const stressPercent = Math.round(state.stressLevel * 100);

          let statusBg = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
          let barBg = 'bg-cyan-500';

          if (state.colorState === 'toxic') {
            statusBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
            barBg = 'bg-rose-500';
          } else if (state.colorState === 'stressed') {
            statusBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
            barBg = 'bg-amber-500';
          }

          return (
            <button
              key={key}
              onClick={() => onSelectOrgan(isSelected ? null : key)}
              className={`flex flex-col p-2 rounded-xl text-left transition-all ${
                isSelected
                  ? 'bg-cyan-500/20 border border-cyan-400/60 shadow-lg glow-cyan'
                  : 'hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-slate-100">
                  {info.name.split(' ')[0]}
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${statusBg}`}>
                  {stressPercent}%
                </span>
              </div>

              {/* Mini Stress Bar */}
              <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full ${barBg} transition-all duration-300`}
                  style={{ width: `${Math.min(100, Math.max(5, stressPercent))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>Conc:</span>
                <span>{state.concentration.toFixed(1)} mg/L</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
