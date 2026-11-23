import React, { Suspense, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { StudioEnvironment } from './StudioEnvironment';
import { AnatomicalHumanModel } from './AnatomicalHumanModel';
import { CameraRig } from './CameraRig';
import { 
  AnatomySex, 
  AnatomySystem, 
  ORGAN_INFO_MAP 
} from '../../types/ui';
import { SimulationTimeStep } from '../../engine/types';
import { ANATOMY_BY_KEY } from 'open-anatomy-3d';

interface SceneProps {
  currentStep: SimulationTimeStep;
  sex?: AnatomySex;
  dissectionDepth: number;
  systemVisibility: Record<AnatomySystem, boolean>;
  systemOpacity?: Record<AnatomySystem, number>;
  selectedKey: string | null;
  hoveredKey: string | null;
  isolatedKey: string | null;
  viewPreset: { id: string; trigger: number } | string | null;
  focusTrigger?: number;
  stressHeatmapVisible?: boolean;
  onSelectKey: (key: string | null) => void;
  onHoverKey: (key: string | null) => void;
}

export const Scene: React.FC<SceneProps> = ({
  currentStep,
  sex = 'male',
  dissectionDepth,
  systemVisibility,
  systemOpacity,
  selectedKey,
  hoveredKey,
  isolatedKey,
  viewPreset,
  focusTrigger = 0,
  stressHeatmapVisible = true,
  onSelectKey,
  onHoverKey
}) => {
  const [structuresMap, setStructuresMap] = useState<Map<string, any>>(new Map());
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  const handleStructuresDiscovered = useCallback((map: Map<string, any>) => {
    setStructuresMap(map);
  }, []);

  // Compute camera target and framing distance for selected structure
  const { targetCenter, targetDistance } = useMemo(() => {
    if (!selectedKey) {
      return { targetCenter: null, targetDistance: null };
    }

    const structure = structuresMap.get(selectedKey);
    if (structure && structure.center) {
      const radius = structure.radius || 0.12;
      // Frame distance proportional to organ size: brain/liver/lungs ~0.8m, kidney ~0.6m, bone/heart ~0.7m
      const distance = Math.max(0.48, Math.min(2.0, radius * 3.2));
      return {
        targetCenter: structure.center.clone(),
        targetDistance: distance
      };
    }

    // Fallback to ORGAN_INFO_MAP coordinates if map is still populating
    const fallback = ORGAN_INFO_MAP[selectedKey];
    if (fallback?.position) {
      return {
        targetCenter: new THREE.Vector3(...fallback.position),
        targetDistance: 0.85
      };
    }

    return { targetCenter: null, targetDistance: null };
  }, [selectedKey, structuresMap]);

  // Hovered info lookup
  const hoveredInfo = useMemo(() => {
    if (!hoveredKey) return null;
    const catalogInfo = ANATOMY_BY_KEY[hoveredKey];
    const clinicalInfo = ORGAN_INFO_MAP[hoveredKey];

    // Determine PK status
    let pkStatus = 'Physiological';
    let concentrationText = '';

    if (currentStep) {
      if (hoveredKey === 'liver' || hoveredKey === 'gallbladder') {
        const s = currentStep.organs.liver;
        concentrationText = `${s.concentration.toFixed(1)} mg/L`;
        pkStatus = s.colorState === 'toxic' ? 'Toxic Necrosis' : s.colorState === 'stressed' ? 'Cellular Stress' : 'Normal Reserve';
      } else if (hoveredKey === 'heart' || hoveredKey === 'coronary_arteries') {
        const s = currentStep.organs.heart;
        concentrationText = `${s.concentration.toFixed(1)} mg/L`;
        pkStatus = s.colorState === 'toxic' ? 'High Cardiotoxicity Risk' : s.colorState === 'stressed' ? 'Elevated Cardiac Strain' : 'Normal Rhythm';
      } else if (hoveredKey === 'kidney_l' || hoveredKey === 'kidney_r' || hoveredKey === 'bladder') {
        const s = currentStep.organs.kidneys;
        concentrationText = `${s.concentration.toFixed(1)} mg/L`;
        pkStatus = s.colorState === 'toxic' ? 'Renal Impairment' : s.colorState === 'stressed' ? 'Filtration Stress' : 'Normal Clearance';
      } else if (hoveredKey === 'brain' || hoveredKey === 'brainstem' || hoveredKey === 'cerebellum') {
        const s = currentStep.organs.brain;
        concentrationText = `${s.concentration.toFixed(1)} mg/L`;
        pkStatus = s.colorState === 'toxic' ? 'CNS Depression' : 'Active Homeostasis';
      } else if (hoveredKey === 'stomach' || hoveredKey === 'small_intestine' || hoveredKey === 'colon') {
        const s = currentStep.organs.stomach;
        concentrationText = `${s.concentration.toFixed(1)} mg/L`;
        pkStatus = s.colorState === 'toxic' ? 'Gastric Irritation' : 'Normal Digestion';
      } else if (hoveredKey.includes('lung') || hoveredKey === 'bronchi' || hoveredKey === 'trachea') {
        concentrationText = `${(currentStep.plasmaConcentrationMgL * 0.95).toFixed(1)} mg/L`;
        pkStatus = currentStep.plasmaConcentrationMgL > 15 ? 'Pulmonary Capillary Strain' : 'Alveolar Perfusion Safe';
      } else if (catalogInfo?.system === 'vessels' || hoveredKey === 'aorta') {
        concentrationText = `${currentStep.plasmaConcentrationMgL.toFixed(1)} mg/L`;
        pkStatus = 'Systemic Arterial Distribution';
      }
    }

    return {
      label: catalogInfo?.label || clinicalInfo?.name || hoveredKey,
      system: catalogInfo?.system || clinicalInfo?.system || 'Anatomical Structure',
      category: catalogInfo?.category || clinicalInfo?.category || 'Physiology',
      concentrationText,
      pkStatus
    };
  }, [hoveredKey, currentStep]);

  return (
    <div 
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none bg-[#090b10]"
      onPointerLeave={() => {
        onHoverKey(null);
        setHoverPosition(null);
      }}
    >
      <Canvas
        camera={{ position: [0, 0.95, 3.2], fov: 40 }}
        gl={{ 
          antialias: true, 
          alpha: false, 
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15
        }}
        onPointerMissed={() => onSelectKey(null)}
      >
        <Suspense fallback={null}>
          <StudioEnvironment />

          <AnatomicalHumanModel
            sex={sex}
            dissectionDepth={dissectionDepth}
            systemVisibility={systemVisibility}
            systemOpacity={systemOpacity}
            selectedKey={selectedKey}
            hoveredKey={hoveredKey}
            isolatedKey={isolatedKey}
            currentStep={currentStep}
            stressHeatmapVisible={stressHeatmapVisible}
            onHover={(key, pos) => {
              onHoverKey(key);
              if (pos) setHoverPosition(pos);
            }}
            onSelect={onSelectKey}
            onStructuresDiscovered={handleStructuresDiscovered}
          />

          <CameraRig
            targetCenter={targetCenter}
            targetDistance={targetDistance}
            viewPreset={viewPreset}
            focusTrigger={focusTrigger}
          />
        </Suspense>
      </Canvas>

      {/* Floating Medical Raycast Badge tracking cursor position */}
      {hoveredKey && hoveredInfo && hoverPosition && (
        <div
          className="pointer-events-none fixed z-50 transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs transition-opacity duration-150 animate-in fade-in"
          style={{
            left: `${hoverPosition.x}px`,
            top: `${hoverPosition.y - 12}px`
          }}
        >
          <div className="flex items-center space-x-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {hoveredInfo.system} · {hoveredInfo.category}
            </span>
          </div>
          <div className="text-sm font-semibold text-white tracking-tight">
            {hoveredInfo.label}
          </div>
          {hoveredInfo.concentrationText && (
            <div className="mt-1 pt-1 border-t border-slate-800 flex items-center justify-between space-x-3 text-[11px] font-mono">
              <span className="text-slate-400">Exposure:</span>
              <span className="text-cyan-300 font-bold">{hoveredInfo.concentrationText}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                hoveredInfo.pkStatus.includes('Toxic') || hoveredInfo.pkStatus.includes('High') ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                hoveredInfo.pkStatus.includes('Stress') || hoveredInfo.pkStatus.includes('Strain') ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {hoveredInfo.pkStatus}
              </span>
            </div>
          )}
          <div className="text-[9px] text-slate-400 mt-1 italic">
            Click to focus & inspect clinical parameters
          </div>
        </div>
      )}
    </div>
  );
};
