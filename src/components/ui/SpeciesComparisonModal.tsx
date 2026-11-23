import React from 'react';
import { 
  X, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Dna,
  ShieldAlert
} from 'lucide-react';
import { DrugProfile, SimulationResult } from '../../engine/types';

interface SpeciesComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  drug: DrugProfile;
  humanResult: SimulationResult;
  mouseResult: SimulationResult;
}

export const SpeciesComparisonModal: React.FC<SpeciesComparisonModalProps> = ({
  isOpen,
  onClose,
  drug,
  humanResult,
  mouseResult
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel border border-cyan-500/30 p-6 shadow-2xl text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Interspecies Pharmacokinetic Discrepancy Analysis</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  Allometric Scaling
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Demonstrating why preclinical animal testing causes false safety negatives and clinical trial failures
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Banner: Paracetamol Paradox */}
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 mb-6 flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="text-amber-200 font-semibold">The Landmark Preclinical Loophole:</strong>{' '}
            Rodent metabolic rates scale allometrically according to Kleiber's Law ($B \propto M^{0.75}$). In mice (0.025 kg), hepatic blood flow and Phase II conjugation enzymes operate ~6.8x faster per kg than in humans (70 kg). A lethal human overdose of Paracetamol clears rapidly in mice without depleting liver glutathione, giving a <span className="underline decoration-rose-400 font-semibold text-rose-300">dangerous false-negative safety certificate</span> that fails in human patients!
          </div>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Human Cohort Box */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-blue-500/30 shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <h3 className="font-bold text-sm text-white">Homo Sapiens (Human)</h3>
              </div>
              <span className="text-xs font-mono text-cyan-400">70.0 kg</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Allometric Clearance Factor:</span>
                <span className="font-mono font-bold text-slate-200">1.0x (Human Baseline)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Simulated Cmax:</span>
                <span className="font-mono font-bold text-cyan-300">{humanResult.cMax.toFixed(2)} mg/L</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Peak Liver Stress:</span>
                <span className="font-mono font-bold text-rose-400">
                  {Math.round(Math.max(...humanResult.timeline.map(t => t.organs.liver.stressLevel)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Lowest Liver GSH Level:</span>
                <span className="font-mono font-bold text-rose-400">
                  {Math.round(Math.min(...humanResult.timeline.map(t => t.organs.liver.glutathioneReservePct ?? 100)))}%
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Clinical Outcome:</span>
                <span className="font-bold text-rose-400 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  <span>Toxic Necrosis Hazard</span>
                </span>
              </div>
            </div>
          </div>

          {/* Mouse Model Box */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <h3 className="font-bold text-sm text-white">Mus Musculus (Mouse Model)</h3>
              </div>
              <span className="text-xs font-mono text-amber-400">0.025 kg</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Allometric Clearance Factor:</span>
                <span className="font-mono font-bold text-amber-300">6.8x per kg body mass</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Simulated Cmax:</span>
                <span className="font-mono font-bold text-cyan-300">{mouseResult.cMax.toFixed(2)} mg/L</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Peak Liver Stress:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {Math.round(Math.max(...mouseResult.timeline.map(t => t.organs.liver.stressLevel)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Lowest Liver GSH Level:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {Math.round(Math.min(...mouseResult.timeline.map(t => t.organs.liver.glutathioneReservePct ?? 100)))}%
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Animal Trial Result:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>False Negative (Cleared)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory Solution */}
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-cyan-300 mb-1">
              FDA Modernization Act 2.0 Compliance
            </div>
            <p className="text-slate-400">
              Computational human multi-organ digital twins replace unrepresentative animal models with precision human physiology.
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
          >
            Acknowledge & Return
          </button>
        </div>
      </div>
    </div>
  );
};
