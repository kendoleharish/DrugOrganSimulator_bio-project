import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Scene } from './components/3d/Scene';
import { Header } from './components/ui/Header';
import { DissectionControls } from './components/ui/DissectionControls';
import { ClinicalOrganDossier } from './components/ui/ClinicalOrganDossier';
import { MLToxicityCard } from './components/ui/MLToxicityCard';
import { TimelineController } from './components/ui/TimelineController';
import { SpeciesComparisonModal } from './components/ui/SpeciesComparisonModal';
import { ReportModal } from './components/ui/ReportModal';

import { BENCHMARK_DRUGS } from './engine/drugs_dataset';
import { runPharmacokineticSimulation } from './engine/pharmacokinetics';
import { DrugProfile, Species, PatientPhenotype, SimulationResult } from './engine/types';
import { AnatomySex, PhysiologicalSystem } from './types/ui';

export const App: React.FC = () => {
  // Core Pharmacokinetic Parameters
  const [selectedDrug, setSelectedDrug] = useState<DrugProfile>(BENCHMARK_DRUGS[0]);
  const [species, setSpecies] = useState<Species>('human');
  const [phenotype, setPhenotype] = useState<PatientPhenotype>('healthy_adult');
  const [dosageMg, setDosageMg] = useState<number>(500);
  const [dosingIntervalHours, setDosingIntervalHours] = useState<number>(0);

  // Simulation Timeline Playback
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // 3D Anatomical Navigation & Dissection State
  const [sex, setSex] = useState<AnatomySex>('male');
  const [dissectionDepth, setDissectionDepth] = useState<number>(0); // 0 (surface) to 100 (deep)
  const [systemVisibility, setSystemVisibility] = useState<Record<PhysiologicalSystem, boolean>>({
    skin: true,
    muscles: true,
    skeleton: true,
    nervous: true,
    cardiovascular: true,
    respiratory: true,
    digestive: true,
    urinary: true,
    endocrine: true,
    reproductive: true
  });

  // Selected & Hovered Anatomical Structure
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [isolatedKey, setIsolatedKey] = useState<string | null>(null);
  const [viewPreset, setViewPreset] = useState<{ id: string; trigger: number } | null>(null);
  const [focusTrigger, setFocusTrigger] = useState<number>(0);
  const [stressHeatmapVisible, setStressHeatmapVisible] = useState<boolean>(true);

  // Modals
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isSpeciesModalOpen, setIsSpeciesModalOpen] = useState<boolean>(false);

  // Run Quantitative Systems Pharmacology Simulation
  const simulationResult: SimulationResult = useMemo(() => {
    return runPharmacokineticSimulation(
      selectedDrug,
      dosageMg,
      species,
      phenotype,
      dosingIntervalHours,
      dosingIntervalHours > 0 ? 48 : 24
    );
  }, [selectedDrug, dosageMg, species, phenotype, dosingIntervalHours]);

  // Run Human & Rodent Models in parallel for Species Comparison Analysis
  const humanComparisonResult: SimulationResult = useMemo(() => {
    return runPharmacokineticSimulation(
      selectedDrug,
      dosageMg,
      'human',
      'healthy_adult',
      0,
      24
    );
  }, [selectedDrug, dosageMg]);

  const mouseComparisonResult: SimulationResult = useMemo(() => {
    return runPharmacokineticSimulation(
      selectedDrug,
      dosageMg,
      'rodent',
      'healthy_adult',
      0,
      24
    );
  }, [selectedDrug, dosageMg]);

  // Handle drug switch: reset dosage to default standard dose
  const handleSelectDrug = (drug: DrugProfile) => {
    setSelectedDrug(drug);
    setDosageMg(drug.standardDoseMg);
    setCurrentStepIndex(0);
  };

  // Safe bounds check on step index
  const safeStepIndex = Math.min(currentStepIndex, simulationResult.timeline.length - 1);
  const currentStep = simulationResult.timeline[safeStepIndex] || simulationResult.timeline[0];

  // Simulation Playback Timer Loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = Math.max(16, Math.floor(100 / playbackSpeed));
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= simulationResult.timeline.length - 1) {
          return 0; // Loop seamlessly
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, simulationResult.timeline.length]);

  // Handle Structure Selection & Camera Framing
  const handleSelectKey = useCallback((key: string | null) => {
    setSelectedKey(key);
    setViewPreset(null);
    setFocusTrigger((prev) => prev + 1);
  }, []);

  // Handle Dedicated Focus Camera button click
  const handleFocusCamera = useCallback(() => {
    setViewPreset(null);
    setFocusTrigger((prev) => prev + 1);
  }, []);

  // Handle Structure Isolation Toggle
  const handleToggleIsolation = useCallback((key: string) => {
    setIsolatedKey((prev) => (prev === key ? null : key));
  }, []);

  // Handle View Preset Trigger (always increments trigger so clicking the same viewpoint re-centers camera)
  const handleSelectViewPreset = useCallback((preset: string) => {
    setViewPreset((prev) => ({
      id: preset,
      trigger: (prev?.trigger ?? 0) + 1
    }));
  }, []);

  // Handle System Visibility Toggle
  const handleToggleSystem = useCallback((sys: PhysiologicalSystem) => {
    setSystemVisibility((prev) => ({
      ...prev,
      [sys]: !prev[sys]
    }));
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#090b10] select-none text-slate-100 font-sans">
      {/* 1. Clinical Navigation Bar */}
      <Header
        selectedDrug={selectedDrug}
        species={species}
        phenotype={phenotype}
        dosageMg={dosageMg}
        onSelectDrug={handleSelectDrug}
        onToggleSpecies={(sp) => {
          setSpecies(sp);
          setCurrentStepIndex(0);
        }}
        onSelectPhenotype={(ph) => {
          setPhenotype(ph);
          setCurrentStepIndex(0);
        }}
        onSetQuickDose={(dose) => {
          setDosageMg(dose);
          setCurrentStepIndex(0);
        }}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenSpeciesModal={() => setIsSpeciesModalOpen(true)}
      />

      {/* 2. Full-Viewport 3D Anatomical WebGL Canvas */}
      <main className="w-full h-full">
        <Scene
          currentStep={currentStep}
          sex={sex}
          dissectionDepth={dissectionDepth}
          systemVisibility={systemVisibility}
          selectedKey={selectedKey}
          hoveredKey={hoveredKey}
          isolatedKey={isolatedKey}
          viewPreset={viewPreset}
          focusTrigger={focusTrigger}
          stressHeatmapVisible={stressHeatmapVisible}
          onSelectKey={handleSelectKey}
          onHoverKey={setHoveredKey}
        />
      </main>

      {/* 3. Left Anatomical Dissection & Viewport Controls Deck */}
      <DissectionControls
        dissectionDepth={dissectionDepth}
        systemVisibility={systemVisibility}
        sex={sex}
        stressHeatmapVisible={stressHeatmapVisible}
        isolatedKey={isolatedKey}
        onSetDissectionDepth={setDissectionDepth}
        onToggleSystem={handleToggleSystem}
        onSetSex={setSex}
        onToggleStressHeatmap={() => setStressHeatmapVisible(!stressHeatmapVisible)}
        onSelectViewPreset={handleSelectViewPreset}
        onClearIsolation={() => setIsolatedKey(null)}
      />

      {/* 4. Machine Learning Predictive Toxicology Summary Card */}
      <MLToxicityCard prediction={simulationResult.mlPrediction} />

      {/* 5. Right Clinical Organ Dossier & Structure Directory */}
      <ClinicalOrganDossier
        selectedKey={selectedKey}
        currentStep={currentStep}
        drug={selectedDrug}
        simulationResult={simulationResult}
        isolatedKey={isolatedKey}
        onSelectKey={handleSelectKey}
        onToggleIsolation={handleToggleIsolation}
        onFocusCamera={handleFocusCamera}
      />

      {/* 6. Bottom Pharmacokinetic Timeline Scrubber & Dose Configurator */}
      <TimelineController
        currentStepIndex={safeStepIndex}
        totalSteps={simulationResult.timeline.length}
        currentStep={currentStep}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        dosageMg={dosageMg}
        dosingIntervalHours={dosingIntervalHours}
        drug={selectedDrug}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onReset={() => {
          setCurrentStepIndex(0);
          setIsPlaying(false);
        }}
        onSeek={(idx) => {
          setCurrentStepIndex(idx);
          setIsPlaying(false);
        }}
        onSetSpeed={setPlaybackSpeed}
        onChangeDosage={setDosageMg}
        onChangeInterval={(inv) => {
          setDosingIntervalHours(inv);
          setCurrentStepIndex(0);
        }}
      />

      {/* 7. Preclinical Interspecies Allometric Scaling Modal */}
      <SpeciesComparisonModal
        isOpen={isSpeciesModalOpen}
        onClose={() => setIsSpeciesModalOpen(false)}
        drug={selectedDrug}
        humanResult={humanComparisonResult}
        mouseResult={mouseComparisonResult}
      />

      {/* 8. Preclinical ADME & Safety Dossier PDF Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        result={simulationResult}
        drug={selectedDrug}
      />
    </div>
  );
};

export default App;
