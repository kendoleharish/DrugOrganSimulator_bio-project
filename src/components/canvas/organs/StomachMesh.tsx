import React, { useRef } from 'react';
import * as THREE from 'three';
import { OrganState } from '../../../engine/types';
import { OrganGlowMaterial, WarningHaloHull } from '../OrganGlowMaterial';
import { Html } from '@react-three/drei';

interface StomachMeshProps {
  organState: OrganState;
  gutAmountMg?: number;
  isSelected: boolean;
  onSelect: () => void;
  showLabels?: boolean;
  wireframe?: boolean;
}

export const StomachMesh: React.FC<StomachMeshProps> = ({
  organState,
  gutAmountMg = 0,
  isSelected,
  onSelect,
  showLabels = true,
  wireframe = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = React.useState(false);

  // Anatomical Position: Left hypochondrium / epigastrium
  const position: [number, number, number] = [-0.32, 0.42, 0.14];

  // Gastric content glow factor based on unabsorbed drug in stomach
  const gutGlow = Math.min(gutAmountMg / 500, 1.0);

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
      {/* Warning Halo */}
      <group scale={[0.42, 0.48, 0.38]}>
        <WarningHaloHull stressLevel={organState?.stressLevel ?? 0} />
      </group>

      <group rotation={[0.1, 0.2, -0.15]}>
        {/* Esophageal sphincter / Cardia (Top inlet) */}
        <mesh position={[0.06, 0.22, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.045, 0.05, 0.12, 16]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={hovered}
            wireframe={wireframe}
          />
        </mesh>

        {/* Fundus (Superior rounded dome under diaphragm) */}
        <mesh position={[-0.08, 0.18, 0]} scale={[0.18, 0.15, 0.16]}>
          <sphereGeometry args={[1, 24, 20]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={hovered}
            wireframe={wireframe}
          />
        </mesh>

        {/* Stomach Body (Main J-curve pouch) */}
        <mesh position={[-0.06, 0.02, 0.02]} rotation={[0, 0, -0.2]} scale={[0.22, 0.26, 0.18]}>
          <sphereGeometry args={[1, 24, 20]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={hovered}
            wireframe={wireframe}
          />
        </mesh>

        {/* Antrum & Pylorus (Tapering medially toward duodenum) */}
        <mesh position={[0.1, -0.12, 0.02]} rotation={[0, 0, -0.6]} scale={[0.12, 0.18, 0.12]}>
          <coneGeometry args={[1, 1.4, 20]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={hovered}
            wireframe={wireframe}
          />
        </mesh>

        {/* Unabsorbed Drug Bolus Core inside Stomach (glowing amber/cyan depending on drug mass) */}
        {gutAmountMg > 1 && (
          <mesh position={[-0.04, 0.01, 0.02]} scale={[0.08 + 0.08 * gutGlow, 0.1 + 0.1 * gutGlow, 0.08 + 0.08 * gutGlow]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#00f0ff"
              emissiveIntensity={0.6 + gutGlow * 0.8}
              transparent
              opacity={0.8}
            />
          </mesh>
        )}
      </group>

      {/* 3D Floating Status Badge */}
      {(hovered || isSelected || showLabels) && (
        <Html position={[0, 0.36, 0]} center distanceFactor={12}>
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
              <span className="font-semibold tracking-wide">STOMACH / GI</span>
              {gutAmountMg > 0 ? (
                <span className="text-cyan-300 font-mono">{gutAmountMg.toFixed(0)}mg gut</span>
              ) : (
                <span className="text-neutral-400 font-mono">
                  {((organState?.stressLevel ?? 0) * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
