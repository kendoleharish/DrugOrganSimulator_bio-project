import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { OrganState } from '../../engine/types';

interface OrganKidneysProps {
  organState: OrganState;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  stressHeatmapVisible: boolean;
}

export const OrganKidneys: React.FC<OrganKidneysProps> = ({
  organState,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  stressHeatmapVisible
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [localHover, setLocalHover] = useState(false);

  // Procedural anatomical kidney (reniform bean shape with indented hilum)
  const kidneyGeometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.078, 38, 30);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Superior to inferior pole elongation
      y *= 1.48;

      // Antero-posterior compression
      z *= 0.76;

      // Medial concave notch (renal hilum) vs lateral convex margin
      if (x > 0) {
        x *= 1.12;
      } else {
        const hilumDepth = Math.cos(y * 7.5) * 0.028;
        x = Math.min(-0.008, x + hilumDepth);
      }

      pos.setXYZ(i, x, y, z);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  // Dynamic colors & eGFR feedback
  const { organColor, emissiveColor, emissiveIntensity } = useMemo(() => {
    if (!stressHeatmapVisible) {
      return {
        organColor: new THREE.Color(isHovered || isSelected ? '#a855f7' : '#9333ea'),
        emissiveColor: new THREE.Color('#6b21a8'),
        emissiveIntensity: isHovered || isSelected ? 0.35 : 0.15
      };
    }

    // Kidney specific: If eGFR drops below 30%, severe toxic state / acute tubular necrosis
    const isLowGFR = organState.filtrationEfficiencyPct !== undefined && organState.filtrationEfficiencyPct < 30;
    const isToxic = organState.colorState === 'toxic' || organState.stressLevel > 0.6 || isLowGFR;
    const isStressed = organState.colorState === 'stressed' || organState.stressLevel > 0.2 || (organState.filtrationEfficiencyPct !== undefined && organState.filtrationEfficiencyPct < 70);

    if (isToxic) {
      return {
        organColor: new THREE.Color('#ef4444'),
        emissiveColor: new THREE.Color('#991b1b'),
        emissiveIntensity: 0.85
      };
    } else if (isStressed) {
      return {
        organColor: new THREE.Color('#f59e0b'),
        emissiveColor: new THREE.Color('#b45309'),
        emissiveIntensity: 0.55
      };
    } else {
      return {
        organColor: new THREE.Color('#06b6d4'), // Healthy cyan / filtration blue
        emissiveColor: new THREE.Color('#0891b2'),
        emissiveIntensity: isHovered || isSelected ? 0.45 : 0.22
      };
    }
  }, [organState, isHovered, isSelected, stressHeatmapVisible]);

  // Subtle oscillation
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const pulse = 1.0 + Math.sin(t * 1.4) * 0.008;
    const baseScale = isSelected ? 1.08 : isHovered || localHover ? 1.04 : 1.0;
    const finalScale = baseScale * pulse;
    groupRef.current.scale.lerp(new THREE.Vector3(finalScale, finalScale, finalScale), 0.1);
  });

  return (
    <group
      ref={groupRef}
      position={[0.0, 0.54, -0.08]}
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
      {/* Left Kidney */}
      <group position={[-0.2, 0, 0]} rotation={[0.08, -0.15, 0.12]}>
        <mesh geometry={kidneyGeometry}>
          <meshStandardMaterial
            color={organColor}
            emissive={emissiveColor}
            emissiveIntensity={emissiveIntensity}
            roughness={0.38}
            metalness={0.16}
          />
        </mesh>

        {/* Renal Hilum Vessels: Renal Artery (Ruby) & Renal Vein (Cyan) */}
        <mesh position={[0.04, 0.01, 0.01]} rotation={[0, 0, 1.4]}>
          <cylinderGeometry args={[0.008, 0.009, 0.06, 12]} />
          <meshStandardMaterial color="#f43f5e" emissive="#be123c" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0.035, -0.015, 0.02]} rotation={[0, 0, 1.3]}>
          <cylinderGeometry args={[0.010, 0.011, 0.06, 12]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.5} />
        </mesh>

        {/* Adrenal Gland Cap */}
        <mesh position={[0.01, 0.11, 0.01]} scale={[0.85, 0.45, 0.75]}>
          <coneGeometry args={[0.038, 0.055, 16]} />
          <meshStandardMaterial color="#eab308" emissive="#ca8a04" emissiveIntensity={0.25} roughness={0.4} />
        </mesh>

        {/* Renal Pelvis & Descending Ureter */}
        <mesh position={[0.02, -0.03, 0.01]} scale={[0.8, 1.0, 0.7]}>
          <sphereGeometry args={[0.018, 14, 12]} />
          <meshStandardMaterial color="#fcd34d" roughness={0.3} />
        </mesh>
        <mesh position={[0.015, -0.13, 0.015]} rotation={[0.08, 0, -0.08]}>
          <cylinderGeometry args={[0.006, 0.006, 0.18, 12]} />
          <meshStandardMaterial color="#fcd34d" emissive="#d97706" emissiveIntensity={0.2} roughness={0.3} />
        </mesh>
      </group>

      {/* Right Kidney (Positioned slightly lower to accommodate hepatic right lobe) */}
      <group position={[0.2, -0.03, 0]} rotation={[0.08, 0.15, -0.12]}>
        <mesh geometry={kidneyGeometry} scale={[-1, 1, 1]}>
          <meshStandardMaterial
            color={organColor}
            emissive={emissiveColor}
            emissiveIntensity={emissiveIntensity}
            roughness={0.38}
            metalness={0.16}
          />
        </mesh>

        {/* Right Hilum Vessels */}
        <mesh position={[-0.04, 0.01, 0.01]} rotation={[0, 0, -1.4]}>
          <cylinderGeometry args={[0.008, 0.009, 0.06, 12]} />
          <meshStandardMaterial color="#f43f5e" emissive="#be123c" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[-0.035, -0.015, 0.02]} rotation={[0, 0, -1.3]}>
          <cylinderGeometry args={[0.010, 0.011, 0.06, 12]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.5} />
        </mesh>

        {/* Right Adrenal Gland Cap */}
        <mesh position={[-0.01, 0.11, 0.01]} scale={[0.85, 0.45, 0.75]}>
          <coneGeometry args={[0.038, 0.055, 16]} />
          <meshStandardMaterial color="#eab308" emissive="#ca8a04" emissiveIntensity={0.25} roughness={0.4} />
        </mesh>

        {/* Right Ureter descending */}
        <mesh position={[-0.02, -0.03, 0.01]} scale={[0.8, 1.0, 0.7]}>
          <sphereGeometry args={[0.018, 14, 12]} />
          <meshStandardMaterial color="#fcd34d" roughness={0.3} />
        </mesh>
        <mesh position={[-0.015, -0.13, 0.015]} rotation={[0.08, 0, 0.08]}>
          <cylinderGeometry args={[0.006, 0.006, 0.18, 12]} />
          <meshStandardMaterial color="#fcd34d" emissive="#d97706" emissiveIntensity={0.2} roughness={0.3} />
        </mesh>
      </group>

      {/* Selection Holographic Reticles for both kidneys */}
      {(isSelected || isHovered || localHover) && (
        <>
          <mesh position={[-0.2, 0, 0]}>
            <ringGeometry args={[0.15, 0.16, 36]} />
            <meshBasicMaterial
              color={isSelected ? '#38bdf8' : '#e0f2fe'}
              transparent
              opacity={0.75}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0.2, -0.03, 0]}>
            <ringGeometry args={[0.15, 0.16, 36]} />
            <meshBasicMaterial
              color={isSelected ? '#38bdf8' : '#e0f2fe'}
              transparent
              opacity={0.75}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}
    </group>
  );
};
