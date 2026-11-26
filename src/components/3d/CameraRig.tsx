import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { OrbitControls } from '@react-three/drei';
import { ANATOMICAL_CAMERA_PRESETS } from '../../types/ui';

export interface CameraRigProps {
  targetCenter?: THREE.Vector3 | null;
  targetDistance?: number | null;
  viewPreset?: { id: string; trigger: number } | string | null;
  focusTrigger?: number;
  onPoseChange?: () => void;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  targetCenter,
  targetDistance,
  viewPreset,
  focusTrigger
}) => {
  const { camera, invalidate } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Smooth interpolation state
  const isTransitioningRef = useRef<boolean>(false);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.95, 2.8));
  const targetControlsTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.92, 0));

  // Initialize camera position
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0.92, 0);
      controlsRef.current.update();
    }
  }, []);

  // Handle View Preset triggers (handles repeat clicks via trigger count)
  const presetKey = typeof viewPreset === 'object' && viewPreset !== null ? viewPreset.id : viewPreset;
  const presetTrigger = typeof viewPreset === 'object' && viewPreset !== null ? viewPreset.trigger : null;

  useEffect(() => {
    if (!presetKey) return;
    const preset = ANATOMICAL_CAMERA_PRESETS[presetKey];
    if (preset) {
      targetControlsTargetRef.current.set(...preset.target);
      targetCamPosRef.current.set(...preset.position);
      isTransitioningRef.current = true;
      invalidate();
    }
  }, [presetKey, presetTrigger]);

  // Handle selected structure framing & Focus Camera trigger
  useEffect(() => {
    if (targetCenter && targetDistance) {
      targetControlsTargetRef.current.copy(targetCenter);

      // Keep current viewing angle direction relative to target, scaled by targetDistance
      const currentDir = camera.position.clone().sub(controlsRef.current ? controlsRef.current.target : targetCenter);
      if (currentDir.lengthSq() < 0.001) {
        currentDir.set(0, 0.2, 1);
      }
      currentDir.normalize().multiplyScalar(targetDistance);

      targetCamPosRef.current.copy(targetCenter).add(currentDir);
      isTransitioningRef.current = true;
      invalidate();
    } else if (targetCenter === null && !presetKey) {
      // Reset back to standing anatomical view
      targetControlsTargetRef.current.set(0, 0.92, 0);
      targetCamPosRef.current.set(0, 0.95, 2.8);
      isTransitioningRef.current = true;
      invalidate();
    }
  }, [targetCenter, targetDistance, focusTrigger]);

  // Smooth frame interpolation with high-fidelity clinical damping
  useFrame(() => {
    if (!controlsRef.current) return;

    if (isTransitioningRef.current) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Lerp target
      controlsRef.current.target.lerp(targetControlsTargetRef.current, reducedMotion ? 1 : 0.08);

      // Lerp camera position
      camera.position.lerp(targetCamPosRef.current, reducedMotion ? 1 : 0.08);

      // Check if close enough to complete transition
      const targetDist = controlsRef.current.target.distanceTo(targetControlsTargetRef.current);
      const camDist = camera.position.distanceTo(targetCamPosRef.current);

      if (targetDist < 0.005 && camDist < 0.005) {
        controlsRef.current.target.copy(targetControlsTargetRef.current);
        camera.position.copy(targetCamPosRef.current);
        isTransitioningRef.current = false;
      }

      controlsRef.current.update();
      invalidate();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.75}
      zoomSpeed={0.9}
      panSpeed={0.8}
      minDistance={0.25}
      maxDistance={6.5}
      maxPolarAngle={Math.PI * 0.96}
      minPolarAngle={Math.PI * 0.04}
      makeDefault
    />
  );
};
