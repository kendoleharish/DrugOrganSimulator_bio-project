import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraPreset, OrganId, ViewMode } from '../../types/visualizer';
import { SimulationTimeStep } from '../../engine/types';
import { HumanBodySilhouette } from './HumanBodySilhouette';
import { VascularNetwork } from './VascularNetwork';
import { BrainMesh } from './organs/BrainMesh';
import { HeartMesh } from './organs/HeartMesh';
import { StomachMesh } from './organs/StomachMesh';
import { LiverMesh } from './organs/LiverMesh';
import { KidneysMesh } from './organs/KidneysMesh';
import { CameraController } from './CameraController';

interface AnatomicalTwinSceneProps {
  currentStep: SimulationTimeStep;
  selectedOrgan: OrganId | null;
  onSelectOrgan: (id: OrganId) => void;
  cameraPreset: CameraPreset;
  autoRotate: boolean;
  viewMode: ViewMode;
  showLabels: boolean;
  resetSignal?: number;
}

export const AnatomicalTwinScene: React.FC<AnatomicalTwinSceneProps> = ({
  currentStep,
  selectedOrgan,
  onSelectOrgan,
  cameraPreset,
  autoRotate,
  viewMode,
  showLabels,
  resetSignal = 0,
}) => {
  const organs = currentStep?.organs;
  const plasmaConc = currentStep?.plasmaConcentrationMgL ?? 0;
  const gutAmount = currentStep?.gutAmountMg ?? 0;

  const showSilhouette = viewMode !== 'organs-only';
  const wireframeOnly = viewMode === 'wireframe';
  const showVessels = viewMode !== 'organs-only';

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 0.35, 5.6], fov: 45, near: 0.1, far: 50 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: true,
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Obsidian Canvas Scene Clear Color */}
          <color attach="background" args={['#09090b']} />

          {/* Precision Medical Lighting Rig Optimized for Deep Obsidian Canvas */}
          <ambientLight intensity={0.7} color="#e2e8f0" />
          
          {/* Directional Key Light */}
          <directionalLight
            position={[-6, 10, 8]}
            intensity={1.9}
            color="#ffffff"
          />

          {/* Fill Light */}
          <directionalLight
            position={[6, 4, -3]}
            intensity={0.8}
            color="#38bdf8"
          />

          {/* High Rim / Silhouette Backlight */}
          <directionalLight
            position={[0, 8, -6]}
            intensity={1.4}
            color="#0ea5e9"
          />

          {/* Gentle Internal Torso Cavity Light */}
          <pointLight
            position={[0, 0.7, 0.3]}
            intensity={0.9}
            color="#38bdf8"
            distance={4.0}
          />

          {/* Atmospheric Depth Fog Matched to Obsidian Base #09090b */}
          <fog attach="fog" args={['#09090b', 8, 26]} />

          {/* Camera Controller with smooth preset lerp */}
          <CameraController
            activePreset={cameraPreset}
            autoRotate={autoRotate}
            resetSignal={resetSignal}
          />

          {/* Holographic Human Body Silhouette */}
          {showSilhouette && (
            <HumanBodySilhouette
              wireframeOnly={wireframeOnly}
              opacity={viewMode === 'vascular-highlight' ? 0.08 : 0.16}
            />
          )}

          {/* Vascular Circulatory Network & Animated Pulse Flow Particles */}
          <VascularNetwork
            plasmaConcentration={plasmaConc}
            showVessels={showVessels}
          />

          {/* 5 Key Functional Organs with Dynamic Shaders */}
          {organs && (
            <group>
              {/* 1. Brain (Cerebrum / CNS) */}
              <BrainMesh
                organState={organs.brain}
                isSelected={selectedOrgan === 'brain'}
                onSelect={() => onSelectOrgan('brain')}
                showLabels={showLabels}
                wireframe={wireframeOnly}
              />

              {/* 2. Heart (Cardiovascular Center with Dynamic Pulse) */}
              <HeartMesh
                organState={organs.heart}
                isSelected={selectedOrgan === 'heart'}
                onSelect={() => onSelectOrgan('heart')}
                showLabels={showLabels}
                wireframe={wireframeOnly}
              />

              {/* 3. Stomach / GI Tract (Absorption Site) */}
              <StomachMesh
                organState={organs.stomach}
                gutAmountMg={gutAmount}
                isSelected={selectedOrgan === 'stomach'}
                onSelect={() => onSelectOrgan('stomach')}
                showLabels={showLabels}
                wireframe={wireframeOnly}
              />

              {/* 4. Liver (Hepatic Metabolism & NAPQI Site) */}
              <LiverMesh
                organState={organs.liver}
                isSelected={selectedOrgan === 'liver'}
                onSelect={() => onSelectOrgan('liver')}
                showLabels={showLabels}
                wireframe={wireframeOnly}
              />

              {/* 5. Kidneys (Renal Filtration Pair) */}
              <KidneysMesh
                organState={organs.kidneys}
                isSelected={selectedOrgan === 'kidneys'}
                onSelect={() => onSelectOrgan('kidneys')}
                showLabels={showLabels}
                wireframe={wireframeOnly}
              />
            </group>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};
