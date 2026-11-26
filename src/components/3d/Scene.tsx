import React, { Suspense, useState, useMemo, useCallback, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { StudioEnvironment } from './StudioEnvironment';
import { AnatomicalHumanModel } from './AnatomicalHumanModel';
import { CameraRig } from './CameraRig';
import { 
  AnatomySex, 
  AnatomySystem, 
  ORGAN_INFO_MAP 
} from '../../types/ui';
import { Html, useGLTF } from '@react-three/drei';
import { anatomyMetric } from '../../engine/anatomyMetrics';
import { SimulationTimeStep } from '../../engine/types';
import { ANATOMY_BY_KEY } from 'open-anatomy-3d';

interface AnatomyViewportProps {
  sex: AnatomySex;
  children: React.ReactNode;
}

class AnatomyViewport extends React.Component<AnatomyViewportProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  retry = () => {
    useGLTF.clear('/models/anatomy-' + this.props.sex + '.glb');
    this.setState({ failed: false });
  };

  render() {
    if (this.state.failed) {
      return (
        <div className="absolute inset-0 grid place-content-center gap-3 text-center">
          <p role="alert">Could not display the 3D anatomy.</p>
          <button type="button" onClick={this.retry} className="underline">Retry viewer</button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface StructureBounds {
  center: THREE.Vector3;
  radius: number;
}

function ResumeRendering({ active }: { active: boolean }) {
  const invalidate = useThree(state => state.invalidate);
  const size = useThree(state => state.size);
  useEffect(() => { if (active) invalidate(); }, [active, size.width, size.height, invalidate]);
  return null;
}

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
  const [webGlAvailable] = useState(() => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
      if (!context) return false;
      context.getExtension('WEBGL_lose_context')?.loseContext();
      return true;
    } catch {
      return false;
    }
  });
  const stage = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [tabActive, setTabActive] = useState(!document.hidden);
  useEffect(() => {
    const update = () => setTabActive(!document.hidden);
    document.addEventListener('visibilitychange', update);
    const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting));
    if (stage.current) observer.observe(stage.current);
    return () => { document.removeEventListener('visibilitychange', update); observer.disconnect(); };
  }, []);
  const [structuresMap, setStructuresMap] = useState<Map<string, StructureBounds>>(new Map());
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  const handleStructuresDiscovered = useCallback((map: Map<string, StructureBounds>) => {
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

    const metric = anatomyMetric(hoveredKey, currentStep);
    const concentrationText = metric ? metric.amountMg.toFixed(2) + ' mg' : '';
    const pkStatus = metric?.label ?? 'Anatomy only';
    return {
      label: catalogInfo?.label || clinicalInfo?.name || hoveredKey,
      system: catalogInfo?.system || clinicalInfo?.system || 'Anatomical Structure',
      category: catalogInfo?.category || clinicalInfo?.category || 'Physiology',
      concentrationText,
      pkStatus
    };
  }, [hoveredKey, currentStep]);

  return (
    <div ref={stage}
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none bg-[#090b10]"
      onPointerLeave={() => {
        onHoverKey(null);
        setHoverPosition(null);
      }}
    >
      {webGlAvailable ? <AnatomyViewport key={sex} sex={sex}>
      <Canvas
        frameloop={visible && tabActive ? 'demand' : 'never'}
        dpr={[1, 1.5]}
        fallback={<p className="scene-loading">WebGL is unavailable. Simulation controls remain accessible.</p>}
        camera={{ position: [0, 0.95, 2.2], fov: 40 }}
        gl={{ 
          antialias: true, 
          preserveDrawingBuffer: true,
          alpha: false, 
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15
        }}
        onPointerMissed={() => onSelectKey(null)}
      >
        <color attach="background" args={['#000000']} />
        <ResumeRendering active={visible && tabActive} />
        <Suspense fallback={<Html center><span className="scene-loading">Loading anatomyâ€¦</span></Html>}>
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
      </AnatomyViewport> : <p className="scene-loading" role="status">WebGL is unavailable. Simulation controls remain accessible.</p>}

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
              {hoveredInfo.system} Â· {hoveredInfo.category}
            </span>
          </div>
          <div className="text-sm font-semibold text-white tracking-tight">
            {hoveredInfo.label}
          </div>
          {hoveredInfo.concentrationText && (
            <div className="mt-1 pt-1 border-t border-slate-800 flex items-center justify-between space-x-3 text-[11px] font-mono">
              <span className="text-slate-400">Modeled amount</span>
              <span className="text-cyan-300 font-bold">{hoveredInfo.concentrationText}</span>
              <span className="text-[10px] text-slate-300">
                {hoveredInfo.pkStatus}
              </span>
            </div>
          )}
          <div className="text-[9px] text-slate-400 mt-1 italic">
            Click to inspect structure
          </div>
        </div>
      )}
    </div>
  );
};
