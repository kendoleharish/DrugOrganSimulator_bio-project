import React, { useRef } from 'react';
import * as THREE from 'three';
import { OrganState } from '../../../engine/types';
import { OrganGlowMaterial, WarningHaloHull } from '../OrganGlowMaterial';
import { Html } from '@react-three/drei';

interface LiverMeshProps {
  organState: OrganState;
  isSelected: boolean;
  onSelect: () => void;
  showLabels?: boolean;
  wireframe?: boolean;
}

export const LiverMesh: React.FC<LiverMeshProps> = ({
  organState,
  isSelected,
  onSelect,
  showLabels = true,
  wireframe = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = React.useState(false);

  // Anatomical Position: Right hypochondrium & epigastrium under diaphragm
  const position: [number, number, number] = [0.36, 0.44, 0.12];

  const gsh = organState?.glutathioneReservePct ?? 100;
  const isGshDepleted = gsh < 35;
  const napqiAmount = organState?.activeMetaboliteLevel ?? 0;
  const hasNapqi = napqiAmount > 0.5;

  return (
    <group
      ref={groupRef}
      position={position}
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
      {/* Warning Halo Hull for Acute Hepatic Necrosis */}
      <group scale={[0.62, 0.42, 0.46]}>
        <WarningHaloHull stressLevel={organState?.stressLevel ?? 0} />
      </group>

      <group rotation={[-0.1, -0.2, 0.18]}>
        {/* Right Lobe (Dominant massive lateral wedge) */}
        <mesh position={[0.08, 0.02, 0]} rotation={[0, 0, -0.15]} scale={[0.26, 0.18, 0.22]}>
          <sphereGeometry args={[1, 32, 24]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={hovered}
            wireframe={wireframe}
          />
        </mesh>

        {/* Right Lobe Inferior Border (Tapering wedge) */}
        <mesh position={[0.15, -0.06, 0.02]} rotation={[0, 0, 0.2]} scale={[0.16, 0.11, 0.16]}>
          <coneGeometry args={[1, 1.2, 24]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={hovered}
            wireframe={wireframe}
          />
        </mesh>

        {/* Left Lobe (Extending medially across midline toward stomach) */}
        <mesh position={[-0.14, 0.04, 0.04]} rotation={[0, 0, 0.3]} scale={[0.16, 0.13, 0.15]}>
          <sphereGeometry args={[1, 24, 20]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={hovered}
            wireframe={wireframe}
          />
        </mesh>

        {/* Falciform Ligament boundary line */}
        <mesh position={[-0.04, 0.06, 0.1]} rotation={[0, 0, 0.35]} scale={[0.015, 0.14, 0.04]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#38bdf8" opacity={0.4} transparent />
        </mesh>

        {/* Gallbladder (Inferior surface facet) */}
        <mesh position={[0.05, -0.12, 0.06]} rotation={[0.4, 0, -0.2]} scale={[0.05, 0.08, 0.05]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="#84cc16"
            emissive="#4d7c0f"
            emissiveIntensity={0.4}
            roughness={0.3}
          />
        </mesh>

        {/* Reactive Toxic NAPQI / Necrotic Core Hotspots */}
        {(isGshDepleted || hasNapqi) && (
          <group position={[0.08, 0.02, 0.05]}>
            <mesh scale={[
              Math.min(0.12 + (napqiAmount / 80) * 0.12, 0.24),
              Math.min(0.09 + (napqiAmount / 80) * 0.08, 0.18),
              Math.min(0.10 + (napqiAmount / 80) * 0.10, 0.20)
            ]}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshBasicMaterial
                color="#dc2626"
                wireframe
                transparent
                opacity={0.85}
              />
            </mesh>
          </group>
        )}
      </group>

      {/* 3D Floating Status Badge */}
      {(hovered || isSelected || showLabels) && (
        <Html position={[0, 0.38, 0]} center distanceFactor={12}>
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
              <span className="font-semibold tracking-wide">LIVER (HEPATIC)</span>
              <span className={gsh < 50 ? 'text-rose-400 font-bold' : 'text-neutral-400'}>
                GSH {gsh.toFixed(0)}%
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
