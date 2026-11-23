import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { OrganState } from '../../engine/types';

interface OrganStomachProps {
  organState: OrganState;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  stressHeatmapVisible: boolean;
}

export const OrganStomach: React.FC<OrganStomachProps> = ({
  organState,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  stressHeatmapVisible
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [localHover, setLocalHover] = useState(false);

  // Anatomical J-shape gastric body geometry
  const stomachGeometry = useMemo(() => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.13, 0.0),    // Cardia (esophagus entrance)
      new THREE.Vector3(-0.06, 0.10, 0.03),  // Fundus apex dome
      new THREE.Vector3(-0.11, 0.01, 0.04),  // Greater curvature
      new THREE.Vector3(-0.08, -0.09, 0.03), // Gastric body lower turn
      new THREE.Vector3(0.02, -0.11, 0.01),  // Incisura / Pyloric antrum
      new THREE.Vector3(0.09, -0.08, 0.0)    // Pylorus entering duodenum
    ]);

    return new THREE.TubeGeometry(path, 36, 0.054, 24, false);
  }, []);

  // Duodenal C-Loop exiting pyloric sphincter
  const duodenumGeometry = useMemo(() => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.09, -0.08, 0.0),
      new THREE.Vector3(0.14, -0.10, -0.02),
      new THREE.Vector3(0.16, -0.15, -0.03),
      new THREE.Vector3(0.12, -0.19, -0.02),
      new THREE.Vector3(0.05, -0.18, 0.0)
    ]);
    return new THREE.TubeGeometry(path, 20, 0.018, 14, false);
  }, []);

  // Dynamic colors
  const { organColor, emissiveColor, emissiveIntensity } = useMemo(() => {
    if (!stressHeatmapVisible) {
      return {
        organColor: new THREE.Color(isHovered || isSelected ? '#fdba74' : '#fb923c'),
        emissiveColor: new THREE.Color('#c2410c'),
        emissiveIntensity: isHovered || isSelected ? 0.35 : 0.15
      };
    }

    if (organState.colorState === 'toxic' || organState.stressLevel > 0.6) {
      return {
        organColor: new THREE.Color('#ef4444'),
        emissiveColor: new THREE.Color('#991b1b'),
        emissiveIntensity: 0.85
      };
    } else if (organState.colorState === 'stressed' || organState.stressLevel > 0.2) {
      return {
        organColor: new THREE.Color('#f59e0b'),
        emissiveColor: new THREE.Color('#b45309'),
        emissiveIntensity: 0.55
      };
    } else {
      return {
        organColor: new THREE.Color('#38bdf8'), // Healthy cyan / mucosal blue
        emissiveColor: new THREE.Color('#0369a1'),
        emissiveIntensity: isHovered || isSelected ? 0.45 : 0.22
      };
    }
  }, [organState, isHovered, isSelected, stressHeatmapVisible]);

  // Gastric peristalsis wave animation
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const peristalsis = 1.0 + Math.sin(t * 1.6) * 0.014;
    const baseScale = isSelected ? 1.1 : isHovered || localHover ? 1.05 : 1.0;
    const finalScale = baseScale * peristalsis;
    groupRef.current.scale.lerp(new THREE.Vector3(finalScale, finalScale, finalScale), 0.1);
  });

  return (
    <group
      ref={groupRef}
      position={[-0.22, 0.78, 0.08]}
      rotation={[0.05, 0.15, -0.1]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setLocalHover(true);
        onHover(true);
      }}
      onPointerOut={() => {
        setLocalHover(false);
        onHover(false);
      }}
    >
      {/* Gastric Tube Body (J-Shape) */}
      <mesh geometry={stomachGeometry}>
        <meshStandardMaterial
          color={organColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.35}
          metalness={0.16}
        />
      </mesh>

      {/* Fundus Dome Expansion */}
      <mesh position={[-0.075, 0.09, 0.03]} scale={[1.15, 0.82, 0.98]}>
        <sphereGeometry args={[0.068, 24, 20]} />
        <meshStandardMaterial
          color={organColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.35}
        />
      </mesh>

      {/* Esophagus Entrance Tube */}
      <mesh position={[0.02, 0.17, 0.0]} rotation={[-0.05, 0, 0.1]}>
        <cylinderGeometry args={[0.018, 0.022, 0.10, 16]} />
        <meshStandardMaterial color="#f472b6" emissive="#db2777" emissiveIntensity={0.25} roughness={0.4} />
      </mesh>

      {/* Duodenum C-Loop */}
      <mesh geometry={duodenumGeometry}>
        <meshStandardMaterial color="#f59e0b" emissive="#b45309" emissiveIntensity={0.25} roughness={0.35} />
      </mesh>

      {/* Selection Holographic Reticle */}
      {(isSelected || isHovered || localHover) && (
        <mesh position={[-0.03, -0.01, 0.02]}>
          <ringGeometry args={[0.18, 0.19, 36]} />
          <meshBasicMaterial
            color={isSelected ? '#38bdf8' : '#e0f2fe'}
            transparent
            opacity={0.75}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};
