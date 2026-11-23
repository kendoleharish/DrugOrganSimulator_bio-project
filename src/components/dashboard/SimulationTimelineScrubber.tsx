import React, { useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Activity } from 'lucide-react';
import { SimulationResult, SimulationTimeStep } from '../../engine/types';

interface SimulationTimelineScrubberProps {
  result: SimulationResult;
  currentIndex: number;
  onSeekIndex: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onSetPlaybackSpeed: (speed: number) => void;
  onResetTime: () => void;
}

export const SimulationTimelineScrubber: React.FC<SimulationTimelineScrubberProps> = ({
  result,
  currentIndex,
  onSeekIndex,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onSetPlaybackSpeed,
  onResetTime,
}) => {
  const timeline = result?.timeline || [];
  const currentStep: SimulationTimeStep = timeline[currentIndex] || timeline[0];
  const maxIndex = Math.max(timeline.length - 1, 0);

  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  useEffect(() => {
    if (!isPlaying || maxIndex <= 0) return;

    const intervalMs = Math.max(100 / playbackSpeed, 20);
    const timer = setInterval(() => {
      const next = currentIndexRef.current + 1;
      if (next > maxIndex) {
        onTogglePlay(); // reached end
      } else {
        onSeekIndex(next);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, maxIndex, playbackSpeed, onSeekIndex, onTogglePlay]);

  const handlePlayButtonClick = () => {
    if (!isPlaying && currentIndex >= maxIndex) {
      onSeekIndex(0);
    }
    onTogglePlay();
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  const currentTime = currentStep?.timeHours ?? 0;
  const totalTime = result?.totalDurationHours ?? 24;
  const tMaxPct = result?.tMax ? (result.tMax / totalTime) * 100 : 0;

  return (
    <div className="w-full glass-minimal rounded-xl p-3 shadow-2xl border border-white/[0.08] text-neutral-100">
      <div className="flex flex-col gap-2">
        {/* Top Info Row */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.08] text-neutral-200 font-medium">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Time: {formatTime(currentTime)} after taking medicine
            </span>
            <span className="text-neutral-500 text-[10px] hidden sm:inline">
              Step {currentIndex + 1} of {timeline.length}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-neutral-300">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span className="text-neutral-500">In Blood:</span>
              <strong className="text-white font-medium">{currentStep?.plasmaConcentrationMgL?.toFixed(2)}</strong>
              <span className="text-[10px] text-neutral-500">mg/L</span>
            </div>

            <span className="text-neutral-400 hidden md:inline">
              Highest Blood Level: <strong className="text-neutral-200">{result?.cMax?.toFixed(2)} mg/L</strong> at hour {result?.tMax?.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Timeline Slider Track */}
        <div className="relative flex items-center w-full py-1 group">
          {/* Tmax indicator pin on timeline track */}
          {tMaxPct > 0 && tMaxPct <= 100 && (
            <div
              className="absolute top-0 bottom-0 w-px bg-cyan-400/80 z-10 pointer-events-none"
              style={{ left: `${tMaxPct}%` }}
              title={`Peak blood level at hour ${result.tMax}`}
            >
              <div className="absolute -top-3.5 -translate-x-1/2 text-[9px] font-mono text-cyan-300 bg-[#09090b]/90 border border-cyan-500/40 px-1.5 py-0.5 rounded font-medium whitespace-nowrap flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                Peak Blood Level
              </div>
            </div>
          )}

          <input
            type="range"
            min={0}
            max={maxIndex}
            value={currentIndex}
            onChange={(e) => onSeekIndex(parseInt(e.target.value, 10))}
            className="w-full cursor-pointer focus:outline-none"
          />
        </div>

        {/* Bottom Playback Controls */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayButtonClick}
              className={`px-3.5 py-1.5 text-xs font-mono font-semibold cursor-pointer rounded-lg flex items-center gap-1.5 transition-all ${
                isPlaying
                  ? 'bg-amber-400 text-black hover:bg-amber-300'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              onClick={onResetTime}
              className="btn-secondary-minimal p-1.5 text-xs text-neutral-400 hover:text-white transition-all cursor-pointer"
              title="Restart from beginning (0 hours)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed Multiplier Segmented Pills */}
          <div className="flex items-center gap-0.5 well-minimal p-0.5">
            {[1, 2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => onSetPlaybackSpeed(s)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                  playbackSpeed === s
                    ? 'bg-white/[0.12] text-white font-medium border border-white/10'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {s}x Speed
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
