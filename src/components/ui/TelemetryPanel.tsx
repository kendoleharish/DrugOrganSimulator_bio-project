import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Heart, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  AlertOctagon,
  Dna,
  Gauge
} from 'lucide-react';
import { OrganKey, ORGAN_INFO_MAP } from '../../types/ui';
import { SimulationTimeStep, DrugProfile, SimulationResult } from '../../engine/types';

interface TelemetryPanelProps {
  selectedOrgan: OrganKey | null;
  currentStep: SimulationTimeStep;
  drug: DrugProfile;
  simulationResult: SimulationResult;
  onClose: () => void;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  selectedOrgan,
  currentStep,
  drug,
  simulationResult,
  onClose
}) => {
  if (!selectedOrgan) {
    // Show Whole-Body Systemic Overview
    return (
      <div className="absolute bottom-28 right-5 z-20 w-80 p-4 rounded-2xl glass-panel shadow-2xl border border-cyan-500/20 text-xs">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 mb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">
              Systemic Pharmacokinetics
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">
            T +{currentStep.timeHours.toFixed(1)}h
          </span>
        </div>

        {/* Plasma Exposure HUD */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/50">
            <div className="text-[10px] text-slate-400 uppercase">Plasma Conc</div>
            <div className="text-base font-bold font-mono text-cyan-300">
              {currentStep.plasmaConcentrationMgL.toFixed(2)}{' '}
              <span className="text-[10px] font-normal text-slate-400">mg/L</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/50">
            <div className="text-[10px] text-slate-400 uppercase">Peak Cmax</div>
            <div className="text-base font-bold font-mono text-emerald-300">
              {simulationResult.cMax.toFixed(2)}{' '}
              <span className="text-[10px] font-normal text-slate-400">mg/L</span>
            </div>
          </div>
        </div>

        {/* Systemic Alert Banner */}
        {currentStep.systemicAlert ? (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 mb-3 flex items-start space-x-2">
            <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] leading-snug">
              {currentStep.systemicAlert}
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 mb-3 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-[11px]">Organs physiologically compensated</span>
          </div>
        )}

        {/* Chemical Molecular Fingerprint */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
            <span>Compound: {drug.properties.name}</span>
            <span>MW: {drug.properties.molecularWeight} g/mol</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>LogP: {drug.properties.logP}</span>
            <span>TPSA: {drug.properties.tpsa} Å²</span>
          </div>
        </div>
      </div>
    );
  }

  const info = ORGAN_INFO_MAP[selectedOrgan];
  const organState = currentStep.organs[selectedOrgan];
  const stressPercent = Math.round(organState.stressLevel * 100);

  return (
    <div className="absolute bottom-28 right-5 z-20 w-84 p-4 rounded-2xl glass-panel shadow-2xl border border-cyan-500/30 text-xs animate-in fade-in duration-200">
      {/* Organ Title Header */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5 mb-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            {info.system}
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            {info.name}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800/60"
        >
          ✕
        </button>
      </div>

      {/* Main Stress Meter */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/50 mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tissue Cellular Stress</span>
          </span>
          <span
            className={`text-xs font-mono font-bold ${
              organState.colorState === 'toxic'
                ? 'text-rose-400'
                : organState.colorState === 'stressed'
                ? 'text-amber-400'
                : 'text-cyan-400'
            }`}
          >
            {stressPercent}% {organState.colorState.toUpperCase()}
          </span>
        </div>

        {/* Progress Bar with Gradient */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              organState.colorState === 'toxic'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                : organState.colorState === 'stressed'
                ? 'bg-gradient-to-r from-cyan-500 to-amber-500'
                : 'bg-gradient-to-r from-teal-500 to-cyan-500'
            }`}
            style={{ width: `${Math.max(5, Math.min(100, stressPercent))}%` }}
          />
        </div>
      </div>

      {/* Organ-Specific Biomarker HUD */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Tissue Exposure</div>
          <div className="text-sm font-bold font-mono text-cyan-300">
            {organState.concentration.toFixed(2)}{' '}
            <span className="text-[10px] font-normal text-slate-400">mg/L</span>
          </div>
        </div>

        {selectedOrgan === 'liver' && (
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">GSH Reserve</div>
            <div
              className={`text-sm font-bold font-mono ${
                (organState.glutathioneReservePct ?? 100) < 30 ? 'text-rose-400' : 'text-emerald-300'
              }`}
            >
              {(organState.glutathioneReservePct ?? 100).toFixed(0)}%
            </div>
          </div>
        )}

        {selectedOrgan === 'kidneys' && (
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">eGFR Efficiency</div>
            <div
              className={`text-sm font-bold font-mono ${
                (organState.filtrationEfficiencyPct ?? 100) < 50 ? 'text-rose-400' : 'text-emerald-300'
              }`}
            >
              {(organState.filtrationEfficiencyPct ?? 100).toFixed(0)}%
            </div>
          </div>
        )}

        {selectedOrgan === 'heart' && (
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Cardiotoxicity</div>
            <div
              className={`text-sm font-bold font-mono ${
                simulationResult.mlPrediction.cardiotoxicityProb > 50 ? 'text-rose-400' : 'text-emerald-300'
              }`}
            >
              {simulationResult.mlPrediction.cardiotoxicityProb}%
            </div>
          </div>
        )}

        {selectedOrgan === 'brain' && (
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">BBB Penetrability</div>
            <div className="text-sm font-bold font-mono text-cyan-300">
              {drug.properties.logP > 0 ? 'High' : 'Selective'}
            </div>
          </div>
        )}

        {selectedOrgan === 'stomach' && (
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Mucosal Integrity</div>
            <div className="text-sm font-bold font-mono text-cyan-300">
              {organState.stressLevel > 0.4 ? 'Compromised' : 'Intact'}
            </div>
          </div>
        )}
      </div>

      {/* Reactive Metabolite Alert */}
      {selectedOrgan === 'liver' && (organState.activeMetaboliteLevel ?? 0) > 0.05 && (
        <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 mb-3 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="text-[10px] leading-tight">
            <strong className="text-rose-200">Toxic Reactive Metabolite:</strong> Free{' '}
            {drug.toxicMetaboliteName ?? 'NAPQI'} detected at{' '}
            {(organState.activeMetaboliteLevel ?? 0).toFixed(1)} ppm. Centrilobular necrosis initiated!
          </div>
        </div>
      )}

      {/* Clinical Pathology Description */}
      <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-300">
        <p className="text-slate-400 italic mb-1">{info.description}</p>
        <p className="text-[10px] text-cyan-300/90 font-medium">
          <strong>Clinical Risk:</strong> {info.clinicalSignificance}
        </p>
      </div>
    </div>
  );
};
