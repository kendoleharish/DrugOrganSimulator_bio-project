import React, { useRef } from 'react';
import * as THREE from 'three';
import { OrganState } from '../../../engine/types';
import { OrganGlowMaterial, WarningHaloHull } from '../OrganGlowMaterial';
import { Html } from '@react-three/drei';

interface KidneysMeshProps {
  organState: OrganState;
  isSelected: boolean;
  onSelect: () => void;
  showLabels?: boolean;
  wireframe?: boolean;
}

// Single Bean-shaped Kidney Component
const KidneyUnit: React.FC<{
  position: [number, number, number];
  rotation: [number, number, number];
  isLeft: boolean;
  organState: OrganState;
  isSelected: boolean;
  isHovered: boolean;
  wireframe?: boolean;
}> = ({ position, rotation, isLeft, organState, isSelected, isHovered, wireframe = false }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Warning Halo for Nephrotoxicity */}
      <group scale={[0.3, 0.36, 0.28]}>
        <WarningHaloHull stressLevel={organState?.stressLevel ?? 0} />
      </group>

      {/* Main Renal Body (Bean/Reniform shape composed of overlapping lobes) */}
      <group>
        {/* Upper Pole */}
        <mesh position={[0, 0.08, 0]} scale={[0.12, 0.12, 0.11]}>
          <sphereGeometry args={[1, 24, 20]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={isHovered}
            wireframe={wireframe}
          />
        </mesh>

        {/* Lower Pole */}
        <mesh position={[0, -0.08, 0]} scale={[0.11, 0.13, 0.1]}>
          <sphereGeometry args={[1, 24, 20]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={isHovered}
            wireframe={wireframe}
          />
        </mesh>

        {/* Lateral convex border */}
        <mesh position={[isLeft ? -0.05 : 0.05, 0, 0]} scale={[0.1, 0.16, 0.1]}>
          <sphereGeometry args={[1, 20, 16]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={isHovered}
            wireframe={wireframe}
          />
        </mesh>

        {/* Medial Hilum Notch / Renal Pelvis */}
        <mesh position={[isLeft ? 0.05 : -0.05, 0, 0]} scale={[0.04, 0.08, 0.06]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive="#0369a1"
            emissiveIntensity={0.3}
            roughness={0.4}
          />
        </mesh>

        {/* Adrenal Gland (Superior Pole Cap) */}
        <mesh position={[0, 0.18, 0.01]} scale={[0.07, 0.04, 0.05]}>
          <coneGeometry args={[1, 1.2, 16]} />
          <meshStandardMaterial
            color="#eab308"
            emissive="#ca8a04"
            emissiveIntensity={0.4}
            roughness={0.3}
          />
        </mesh>

        {/* Ureter descending toward bladder */}
        <mesh position={[isLeft ? 0.04 : -0.04, -0.22, -0.02]} rotation={[0, 0, isLeft ? -0.1 : 0.1]}>
          <cylinderGeometry args={[0.012, 0.012, 0.28, 12]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.2}
            transparent
            opacity={0.65}
          />
        </mesh>
      </group>
    </group>
  );
};

export const KidneysMesh: React.FC<KidneysMeshProps> = ({
  organState,
  isSelected,
  onSelect,
  showLabels = true,
  wireframe = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = React.useState(false);

  // Anatomical Positions:
  // Left Kidney sits slightly higher (T12 to L3)
  const leftPos: [number, number, number] = [-0.36, -0.05, -0.12];
  // Right Kidney sits ~0.08 units lower to accommodate liver overhead
  const rightPos: [number, number, number] = [0.36, -0.13, -0.12];

  const egfr = organState?.filtrationEfficiencyPct ?? 100;

  return (
    <group
      ref={groupRef}
      scale={isSelected ? 1.08 : hovered ? 1.04 : 1.0}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Left Kidney */}
      <KidneyUnit
        position={leftPos}
        rotation={[0.1, 0.2, 0.15]}
        isLeft={true}
        organState={organState}
        isSelected={isSelected}
        isHovered={hovered}
        wireframe={wireframe}
      />

      {/* Right Kidney (Anatomically lower) */}
      <KidneyUnit
        position={rightPos}
        rotation={[0.1, -0.2, -0.15]}
        isLeft={false}
        organState={organState}
        isSelected={isSelected}
        isHovered={hovered}
        wireframe={wireframe}
      />

      {/* 3D Floating Status Badge centered between kidneys */}
      {(hovered || isSelected || showLabels) && (
        <Html position={[0, -0.08, -0.05]} center distanceFactor={12}>
          <div
            className={`pointer-events-none select-none px-2 py-0.5 rounded-md text-[10px] font-mono whitespace-nowrap shadow-xl backdrop-blur-xl transition-all duration-200 border ${
              isSelected
                ? 'bg-[#09090b]/90 border-cyan-400/40 text-white'
                : hovered
                ? 'bg-[#09090b]/80 border-white/20 text-neutral-100'
                : 'bg-[#09090b]/70 border-white/[0.08] text-neutral-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  organState?.colorState === 'toxic'
                    ? 'bg-rose-500 animate-ping'
                    : organState?.colorState === 'stressed'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="font-semibold tracking-wide">KIDNEYS (RENAL)</span>
              <span className={egfr < 50 ? 'text-rose-400 font-bold' : 'text-neutral-400'}>
                eGFR {egfr.toFixed(0)}%
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
