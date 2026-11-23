import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CameraPreset } from '../../types/visualizer';

interface CameraControllerProps {
  activePreset: CameraPreset;
  autoRotate: boolean;
  resetSignal?: number;
  onControlsChange?: () => void;
}

const PRESET_CONFIGS: Record<CameraPreset, { position: [number, number, number]; target: [number, number, number] }> = {
  body: {
    position: [0, 0.35, 5.6],
    target: [0, 0.35, 0],
  },
  brain: {
    position: [0, 2.22, 1.8],
    target: [0, 2.22, 0],
  },
  heart: {
    position: [-0.2, 1.05, 1.7],
    target: [-0.14, 1.05, 0.14],
  },
  stomach: {
    position: [-0.38, 0.42, 1.7],
    target: [-0.32, 0.42, 0.14],
  },
  liver: {
    position: [0.42, 0.44, 1.7],
    target: [0.36, 0.44, 0.12],
  },
  kidneys: {
    position: [0, -0.1, 1.8],
    target: [0, -0.09, -0.12],
  },
};

export const CameraController: React.FC<CameraControllerProps> = ({
  activePreset,
  autoRotate,
  resetSignal = 0,
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Targets for smooth animation
  const targetCamPos = useRef(new THREE.Vector3(...PRESET_CONFIGS[activePreset].position));
  const targetLookAt = useRef(new THREE.Vector3(...PRESET_CONFIGS[activePreset].target));
  const isTransitioning = useRef(true);

  // When preset or resetSignal changes, update animation goals
  useEffect(() => {
    const config = PRESET_CONFIGS[activePreset] || PRESET_CONFIGS.body;
    targetCamPos.current.set(...config.position);
    targetLookAt.current.set(...config.target);
    isTransitioning.current = true;
  }, [activePreset, resetSignal]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    if (isTransitioning.current) {
      // Lerp camera position
      camera.position.lerp(targetCamPos.current, Math.min(delta * 4.5, 1));

      // Lerp OrbitControls target
      controlsRef.current.target.lerp(targetLookAt.current, Math.min(delta * 4.5, 1));
      controlsRef.current.update();

      // Check convergence
      const posDist = camera.position.distanceTo(targetCamPos.current);
      const targetDist = controlsRef.current.target.distanceTo(targetLookAt.current);

      if (posDist < 0.01 && targetDist < 0.01) {
        camera.position.copy(targetCamPos.current);
        controlsRef.current.target.copy(targetLookAt.current);
        controlsRef.current.update();
        isTransitioning.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.8}
      zoomSpeed={0.8}
      panSpeed={0.7}
      minDistance={1.1}
      maxDistance={9.5}
      minPolarAngle={0.08}
      maxPolarAngle={Math.PI * 0.92}
      autoRotate={autoRotate}
      autoRotateSpeed={1.0}
      makeDefault
      onStart={() => {
        // Stop preset lerp immediately when user manually starts dragging
        isTransitioning.current = false;
      }}
    />
  );
};
