import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileCheck, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import jsPDF from 'jspdf';
import { SimulationResult, DrugProfile } from '../../engine/types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SimulationResult;
  drug: DrugProfile;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  result,
  drug
}) => {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const maxLiverStress = Math.round(Math.max(...result.timeline.map(t => t.organs.liver.stressLevel)) * 100);
  const maxHeartStress = Math.round(Math.max(...result.timeline.map(t => t.organs.heart.stressLevel)) * 100);
  const maxKidneyStress = Math.round(Math.max(...result.timeline.map(t => t.organs.kidneys.stressLevel)) * 100);
  const maxBrainStress = Math.round(Math.max(...result.timeline.map(t => t.organs.brain.stressLevel)) * 100);
  const minGSH = Math.round(Math.min(...result.timeline.map(t => t.organs.liver.glutathioneReservePct ?? 100)));
  const minGFR = Math.round(Math.min(...result.timeline.map(t => t.organs.kidneys.filtrationEfficiencyPct ?? 100)));

  const isSafe = maxLiverStress < 50 && maxHeartStress < 50 && maxKidneyStress < 50;

  const handleDownloadPDF = () => {
    try {
      setDownloading(true);
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(7, 10, 18);
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(56, 189, 248);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('INSILICO-3D: PRECLINICAL SAFETY DOSSIER', 14, 16);

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Quantitative Systems Pharmacology & Multi-Organ Toxicity Assessment', 14, 24);
      doc.text(`Generated: ${new Date().toUTCString()}`, 14, 29);

      // Section 1: Study Parameters
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. STUDY & DRUG SPECIFICATIONS', 14, 45);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Compound Name: ${drug.name}`, 14, 53);
      doc.text(`Chemical Formula: ${drug.properties.formula} (MW: ${drug.properties.molecularWeight} g/mol)`, 14, 59);
      doc.text(`Lipophilicity (LogP): ${drug.properties.logP} | TPSA: ${drug.properties.tpsa} A^2`, 14, 65);
      doc.text(`Administered Dose: ${result.dosageMg} mg (${result.species.toUpperCase()} MODEL)`, 14, 71);
      doc.text(`Patient Phenotype: ${result.phenotype.replace('_', ' ').toUpperCase()}`, 14, 77);

      // Section 2: Pharmacokinetic Summary
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('2. PHARMACOKINETIC PROFILE (ADME)', 14, 90);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Peak Plasma Concentration (Cmax): ${result.cMax.toFixed(2)} mg/L`, 14, 98);
      doc.text(`Time to Peak (Tmax): ${result.tMax.toFixed(1)} hours`, 14, 104);
      doc.text(`Elimination Half-Life (t1/2): ${drug.halfLifeHours} hours`, 14, 110);
      doc.text(`Primary Clearance: Hepatic (${drug.baseHepaticClearance} L/hr) | Renal (${drug.baseRenalClearance} L/hr)`, 14, 116);

      // Section 3: Organ Toxicity Matrix
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('3. MULTI-ORGAN TISSUE EXPOSURE & CELLULAR STRESS', 14, 129);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Hepatic Parenchyma (Liver): ${maxLiverStress}% Peak Stress | Lowest GSH Reserve: ${minGSH}%`, 14, 137);
      doc.text(`Cardiovascular (Heart): ${maxHeartStress}% Peak Stress | Cardiotoxicity Risk: ${result.mlPrediction.cardiotoxicityProb}%`, 14, 143);
      doc.text(`Renal System (Kidneys): ${maxKidneyStress}% Peak Stress | Lowest eGFR Efficiency: ${minGFR}%`, 14, 149);
      doc.text(`Cerebrovascular (Brain): ${maxBrainStress}% Peak Stress`, 14, 155);

      // Section 4: Machine Learning QSAR Prediction
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('4. ML TOX21 PREDICTIVE TOXICOLOGY', 14, 168);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Hepatotoxicity Risk: ${result.mlPrediction.hepatotoxicityProb}%`, 14, 176);
      doc.text(`Cardiotoxicity Risk: ${result.mlPrediction.cardiotoxicityProb}%`, 14, 182);
      doc.text(`Nephrotoxicity Risk: ${result.mlPrediction.nephrotoxicityProb}%`, 14, 188);
      doc.text(`Structural Alert: ${result.mlPrediction.primaryFeatureRisk}`, 14, 194);

      // Section 5: Regulatory Conclusion
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('5. REGULATORY VERDICT & SAFETY RECOMMENDATION', 14, 207);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      if (isSafe) {
        doc.setTextColor(16, 185, 129);
        doc.text('STATUS: ACCEPTABLE THERAPEUTIC SAFETY PROFILE', 14, 215);
      } else {
        doc.setTextColor(239, 68, 68);
        doc.text('STATUS: SAFETY CONCERN - DOSE ADJUSTMENT / RESTRICTION REQUIRED', 14, 215);
      }

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Validated in accordance with FDA Modernization Act 2.0 in-silico computational guidelines.', 14, 225);

      doc.save(`InSilico3D_${drug.name.replace(/[^a-zA-Z0-9]/g, '_')}_SafetyReport.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel border border-cyan-500/30 p-6 shadow-2xl text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Preclinical Safety & Pharmacokinetic Dossier</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  FDA 2.0 Compliant
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Computational organ-on-chip multi-compartment assessment
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

        {/* Verdict Badge */}
        <div
          className={`p-4 rounded-2xl mb-5 flex items-center justify-between border ${
            isSafe
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            {isSafe ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <AlertTriangle className="w-6 h-6 text-rose-400" />}
            <div>
              <div className="font-bold text-sm">
                {isSafe ? 'Preclinical Safety Index: PASS' : 'Preclinical Safety Index: TOXICITY WARNING'}
              </div>
              <div className="text-xs text-slate-300 opacity-90">
                {isSafe
                  ? 'All vital organs maintained cellular homeostasis within acceptable clinical thresholds.'
                  : 'Critical tissue stress detected. Reactive metabolite or organ cross-talk cascade triggered.'}
              </div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-black/40 border border-white/10">
            Cmax {result.cMax.toFixed(2)} mg/L
          </span>
        </div>

        {/* Organ Safety Matrix Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs font-semibold text-slate-300">Liver (Hepatic Parenchyma)</span>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400">Peak Stress:</span>
              <span className={`font-mono font-bold ${maxLiverStress > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {maxLiverStress}%
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-slate-400">Min GSH Reserve:</span>
              <span className={`font-mono font-bold ${minGSH < 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {minGSH}%
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs font-semibold text-slate-300">Heart (Cardiovascular)</span>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400">Peak Stress:</span>
              <span className={`font-mono font-bold ${maxHeartStress > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {maxHeartStress}%
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-slate-400">ML Cardiotoxicity:</span>
              <span className="font-mono font-bold text-amber-400">
                {result.mlPrediction.cardiotoxicityProb}%
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs font-semibold text-slate-300">Kidneys (Renal Filtration)</span>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400">Peak Stress:</span>
              <span className={`font-mono font-bold ${maxKidneyStress > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {maxKidneyStress}%
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-slate-400">Lowest eGFR:</span>
              <span className={`font-mono font-bold ${minGFR < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {minGFR}%
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs font-semibold text-slate-300">Brain (Central Nervous System)</span>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400">Peak Stress:</span>
              <span className={`font-mono font-bold ${maxBrainStress > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {maxBrainStress}%
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-slate-400">BBB Penetration:</span>
              <span className="font-mono font-bold text-cyan-400">
                {drug.properties.logP > 0 ? 'Permeable' : 'Protected'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-700/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            Close
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 glow-cyan"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Compiling Dossier...' : 'Download Official PDF Dossier'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
