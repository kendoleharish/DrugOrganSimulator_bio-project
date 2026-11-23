import React, { useState } from 'react';
import { 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { MLToxicityPrediction } from '../../engine/types';

interface MLToxicityCardProps {
  prediction: MLToxicityPrediction;
}

export const MLToxicityCard: React.FC<MLToxicityCardProps> = ({ prediction }) => {
  const [expanded, setExpanded] = useState(false);

  const getRiskBadge = (prob: number) => {
    if (prob > 60) return 'text-rose-300 bg-rose-500/20 border-rose-500/40';
    if (prob > 30) return 'text-amber-300 bg-amber-500/20 border-amber-500/40';
    return 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40';
  };

  return (
    <div className="absolute top-16 left-80 z-20 w-64 rounded-xl bg-slate-950/85 border border-white/10 shadow-2xl backdrop-blur-md text-xs select-none">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2.5 text-left transition-colors hover:bg-slate-900/50 rounded-xl"
      >
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-md bg-slate-900 text-cyan-400 border border-white/10">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-slate-100 flex items-center gap-1.5 text-[11px]">
              <span>ML Predictive Toxicology</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Confidence: {prediction.confidenceScore}% (QSAR)
            </div>
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>

      {/* Main Bar Highlights */}
      <div className="px-2.5 pb-2.5 space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          {/* Hepatic Risk */}
          <div className="p-1.5 rounded-lg bg-slate-900/80 border border-white/5">
            <div className="text-[9px] text-slate-400 uppercase font-medium">Hepato Risk</div>
            <div className="mt-0.5">
              <span className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded border ${getRiskBadge(prediction.hepatotoxicityProb)}`}>
                {prediction.hepatotoxicityProb}%
              </span>
            </div>
          </div>

          {/* Cardiac Risk */}
          <div className="p-1.5 rounded-lg bg-slate-900/80 border border-white/5">
            <div className="text-[9px] text-slate-400 uppercase font-medium">Cardio Risk</div>
            <div className="mt-0.5">
              <span className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded border ${getRiskBadge(prediction.cardiotoxicityProb)}`}>
                {prediction.cardiotoxicityProb}%
              </span>
            </div>
          </div>
        </div>

        {/* Collapsible Details */}
        {expanded && (
          <div className="pt-2 border-t border-white/10 space-y-1.5 animate-in fade-in">
            <div className="grid grid-cols-2 gap-1.5">
              {/* Nephro Risk */}
              <div className="p-1.5 rounded-lg bg-slate-900/80 border border-white/5">
                <div className="text-[9px] text-slate-400 uppercase font-medium">Nephro Risk</div>
                <div className="mt-0.5">
                  <span className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded border ${getRiskBadge(prediction.nephrotoxicityProb)}`}>
                    {prediction.nephrotoxicityProb}%
                  </span>
                </div>
              </div>

              {/* Neuro Risk */}
              <div className="p-1.5 rounded-lg bg-slate-900/80 border border-white/5">
                <div className="text-[9px] text-slate-400 uppercase font-medium">Neuro Risk</div>
                <div className="mt-0.5">
                  <span className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded border ${getRiskBadge(prediction.neurotoxicityProb)}`}>
                    {prediction.neurotoxicityProb}%
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Attribution Explanation */}
            <div className="p-2 rounded-lg bg-slate-900 border border-white/5 text-[10px] text-slate-300">
              <span className="font-semibold text-cyan-300">Chemical Driver: </span>
              {prediction.primaryFeatureRisk}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
