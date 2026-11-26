import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  AlertTriangle,
  Repeat,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { AdministrationRoute, DrugProfile, SimulationTimeStep } from '../../engine/types';

interface TimelineControllerProps {
  route: AdministrationRoute;
  onRouteChange: (value: AdministrationRoute) => void;
  currentStepIndex: number;
  totalSteps: number;
  currentStep: SimulationTimeStep;
  isPlaying: boolean;
  playbackSpeed: number;
  dosageMg: number;
  dosingIntervalHours: number;
  drug: DrugProfile;
  onTogglePlay: () => void;
  onReset: () => void;
  onSeek: (stepIndex: number) => void;
  onSetSpeed: (speed: number) => void;
  onChangeDosage: (dose: number) => void;
  onChangeInterval: (interval: number) => void;
}

export const TimelineController: React.FC<TimelineControllerProps> = ({
  currentStepIndex,
  totalSteps, route, onRouteChange,
  currentStep,
  isPlaying,
  playbackSpeed,
  dosageMg,
  dosingIntervalHours,
  drug,
  onTogglePlay,
  onReset,
  onSeek,
  onSetSpeed,
  onChangeDosage,
  onChangeInterval
}) => {
  const elapsedMinutes = Math.round(currentStep.timeHours * 60);
  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 px-4 py-3 rounded-xl bg-slate-950/85 border border-white/10 shadow-2xl backdrop-blur-md text-xs select-none">
      <div className="flex flex-col space-y-2">
        {/* Top Row: Playback Controls, Time Readout, Dose Controls */}
        <div className="flex items-center justify-between">
          {/* Left: Playback & Speed */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onTogglePlay}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-95"
              title={isPlaying ? 'Pause Simulation' : 'Run Simulation'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
            </button>

            <button
              onClick={onReset}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title="Reset to Hour 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Time HUD */}
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-white">
                T +{hours.toString().padStart(2, '0')}h {minutes.toString().padStart(2, '0')}m
              </span>
              <span className="text-slate-400 text-[10px]">
                / {((totalSteps - 1) * 0.1).toFixed(0)}h
              </span>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-white/10 text-[10px]">
              {[0.5, 1.0, 2.0, 4.0].map((spd) => (
                <button
                  key={spd}
                  aria-pressed={playbackSpeed === spd}
                  onClick={() => onSetSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded font-medium transition-all ${
                    playbackSpeed === spd
                      ? 'bg-slate-800 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          <label className="route-control">Route <select aria-label="Administration route" value={route} disabled={drug.id === 'doxorubicin'} onChange={e => onRouteChange(e.target.value as AdministrationRoute)}>
            {drug.id !== 'doxorubicin' && <option value="oral">Oral</option>}<option value="iv">IV bolus</option>
          </select></label>
          {/* Right: Dosage & Interval Controls */}
          <div className="flex items-center space-x-3">
            {/* Dosing Interval */}
            <div className="flex items-center space-x-1 text-[11px]">
              <Repeat className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
              <div className="flex p-0.5 rounded-lg bg-slate-900 border border-white/10 text-[10px]">
                {[
                  { label: 'Single', val: 0 },
                  { label: 'Q8H', val: 8 },
                  { label: 'Q12H', val: 12 },
                  { label: 'Q24H', val: 24 }
                ].map((inv) => (
                  <button
                    key={inv.label}
                    aria-pressed={dosingIntervalHours === inv.val}
                    onClick={() => onChangeInterval(inv.val)}
                    className={`px-2 py-0.5 rounded transition-all ${
                      dosingIntervalHours === inv.val
                        ? 'bg-slate-800 text-cyan-300 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {inv.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dose Slider */}
            <div className="flex items-center space-x-2 pl-2 border-l border-white/10">
              <span className="text-[11px] text-slate-400 font-medium">70 kg reference dose:</span>
              <span className="font-mono font-bold text-xs text-cyan-300">
                {dosageMg} mg
              </span>
              <input
                type="range"
                aria-label="Reference dose in milligrams"
                min={0}
                max={Math.min(5000, Math.floor(drug.standardDoseMg * 6))}
                step={1}
                value={dosageMg}
                onChange={(e) => onChangeDosage(Number(e.target.value))}
                className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Bottom Row: Scrubber Timeline Bar */}
        <div className="relative flex items-center pt-1">
          <input
            type="range"
            aria-label="Simulation time"
            min={0}
            max={totalSteps - 1}
            value={currentStepIndex}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>
    </div>
  );
};
