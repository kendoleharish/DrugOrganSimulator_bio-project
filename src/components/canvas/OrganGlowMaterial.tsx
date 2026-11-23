import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { OrganState } from '../../engine/types';

interface OrganGlowMaterialProps {
  organState: OrganState;
  isSelected?: boolean;
  isHovered?: boolean;
  wireframe?: boolean;
  roughness?: number;
  metalness?: number;
  transmission?: number;
}

// Preset color definitions - Luxury clinical biotech palette
const COLOR_HEALTHY_BASE = new THREE.Color('#047857'); // rich emerald jade
const COLOR_HEALTHY_EMISSIVE = new THREE.Color('#059669');
const COLOR_HEALTHY_TINT = new THREE.Color('#0d9488');

const COLOR_STRESSED_BASE = new THREE.Color('#b45309'); // warm clinical amber
const COLOR_STRESSED_EMISSIVE = new THREE.Color('#d97706');

const COLOR_TOXIC_BASE = new THREE.Color('#991b1b'); // deep clinical crimson
const COLOR_TOXIC_EMISSIVE = new THREE.Color('#dc2626');
const COLOR_TOXIC_HALO = new THREE.Color('#ef4444');

export const OrganGlowMaterial: React.FC<OrganGlowMaterialProps> = ({
  organState,
  isSelected = false,
  isHovered = false,
  wireframe = false,
  roughness = 0.22,
  metalness = 0.08,
  transmission = 0.45,
}) => {
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const baseColors = useMemo(() => {
    return {
      currentBase: COLOR_HEALTHY_BASE.clone(),
      currentEmissive: COLOR_HEALTHY_EMISSIVE.clone(),
      targetBase: COLOR_HEALTHY_BASE.clone(),
      targetEmissive: COLOR_HEALTHY_EMISSIVE.clone(),
    };
  }, []);

  useFrame((state, delta) => {
    if (!materialRef.current) return;

    const stress = Math.min(Math.max(organState?.stressLevel ?? 0, 0), 1);
    const time = state.clock.getElapsedTime();

    // Determine target colors according to stress level
    if (stress < 0.35) {
      // Healthy range (0.0 to 0.35): deep emerald with subtle teal rim
      const t = stress / 0.35;
      baseColors.targetBase.copy(COLOR_HEALTHY_BASE).lerp(COLOR_HEALTHY_TINT, t * 0.3);
      baseColors.targetEmissive.copy(COLOR_HEALTHY_EMISSIVE);
    } else if (stress < 0.7) {
      // Stressed range (0.35 to 0.7): warm amber
      const t = (stress - 0.35) / 0.35;
      baseColors.targetBase.copy(COLOR_HEALTHY_BASE).lerp(COLOR_STRESSED_BASE, t);
      baseColors.targetEmissive.copy(COLOR_HEALTHY_EMISSIVE).lerp(COLOR_STRESSED_EMISSIVE, t);
    } else {
      // Toxic range (0.7 to 1.0): deep crimson
      const t = (stress - 0.7) / 0.3;
      baseColors.targetBase.copy(COLOR_STRESSED_BASE).lerp(COLOR_TOXIC_BASE, t);
      baseColors.targetEmissive.copy(COLOR_STRESSED_EMISSIVE).lerp(COLOR_TOXIC_EMISSIVE, t);
    }

    // Smooth lerp toward target colors
    baseColors.currentBase.lerp(baseColors.targetBase, Math.min(delta * 4, 1));
    baseColors.currentEmissive.lerp(baseColors.targetEmissive, Math.min(delta * 4, 1));

    // Dynamic emissive pulse calculation
    let emissivePulse = 0.22;
    if (stress > 0.65) {
      // Rhythmic warning pulse for severe toxicity
      emissivePulse = 0.55 + 0.35 * Math.abs(Math.sin(time * 4.0));
    } else if (stress > 0.3) {
      // Calm breathing pulse for stressed state
      emissivePulse = 0.32 + 0.18 * Math.sin(time * 2.2);
    } else {
      // Subtle organic shimmer for healthy state
      emissivePulse = 0.2 + 0.08 * Math.sin(time * 1.4);
    }

    if (isSelected) {
      emissivePulse += 0.3;
    } else if (isHovered) {
      emissivePulse += 0.15;
    }

    materialRef.current.color.copy(baseColors.currentBase);
    materialRef.current.emissive.copy(baseColors.currentEmissive);
    materialRef.current.emissiveIntensity = emissivePulse;
  });

  return (
    <meshPhysicalMaterial
      ref={materialRef}
      color={COLOR_HEALTHY_BASE}
      emissive={COLOR_HEALTHY_EMISSIVE}
      roughness={roughness}
      metalness={metalness}
      transmission={transmission}
      thickness={1.1}
      ior={1.38}
      clearcoat={0.3}
      clearcoatRoughness={0.15}
      transparent
      opacity={wireframe ? 0.35 : 0.88}
      wireframe={wireframe}
      side={THREE.DoubleSide}
    />
  );
};

// Toxic Warning Halo Hull
export const WarningHaloHull: React.FC<{
  stressLevel: number;
  scale?: number;
}> = ({ stressLevel, scale = 1.15 }) => {
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!haloRef.current) return;
    const time = state.clock.getElapsedTime();

    if (stressLevel > 0.6) {
      haloRef.current.visible = true;
      const pulse = 0.25 + 0.2 * Math.sin(time * 5.0);
      const mat = haloRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = pulse * ((stressLevel - 0.5) / 0.5);
      }
      const s = scale * (1.0 + 0.04 * Math.sin(time * 5.0));
      haloRef.current.scale.set(s, s, s);
    } else {
      haloRef.current.visible = false;
    }
  });

  return (
    <mesh ref={haloRef} visible={false}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshBasicMaterial
        color={COLOR_TOXIC_HALO}
        transparent
        opacity={0.3}
        wireframe
        side={THREE.BackSide}
      />
    </mesh>
  );
};
