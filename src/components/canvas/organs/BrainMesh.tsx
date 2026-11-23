import React, { useRef } from 'react';
import * as THREE from 'three';
import { OrganState } from '../../../engine/types';
import { OrganGlowMaterial, WarningHaloHull } from '../OrganGlowMaterial';
import { Html } from '@react-three/drei';

interface BrainMeshProps {
  organState: OrganState;
  isSelected: boolean;
  onSelect: () => void;
  showLabels?: boolean;
  wireframe?: boolean;
}

export const BrainMesh: React.FC<BrainMeshProps> = ({
  organState,
  isSelected,
  onSelect,
  showLabels = true,
  wireframe = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = React.useState(false);

  // Anatomical Position: Upper cranial vault
  const position: [number, number, number] = [0, 2.22, 0];

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
      {/* Toxic Warning Halo Hull */}
      <group scale={[0.55, 0.45, 0.55]}>
        <WarningHaloHull stressLevel={organState?.stressLevel ?? 0} />
      </group>

      {/* Left Cerebral Hemisphere */}
      <group position={[-0.13, 0, 0]}>
        {/* Main frontal/parietal lobe */}
        <mesh position={[0, 0.04, 0.02]} scale={[0.22, 0.28, 0.36]}>
          <sphereGeometry args={[1, 32, 24]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={hovered}
            wireframe={wireframe}
          />
        </mesh>
        {/* Temporal lobe prominence */}
        <mesh position={[-0.07, -0.09, 0.04]} scale={[0.13, 0.12, 0.2]}>
          <sphereGeometry args={[1, 20, 16]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={hovered}
            wireframe={wireframe}
          />
        </mesh>
        {/* Occipital lobe posterior curve */}
        <mesh position={[0, -0.05, -0.16]} scale={[0.17, 0.16, 0.18]}>
          <sphereGeometry args={[1, 20, 16]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={hovered}
            wireframe={wireframe}
          />
        </mesh>
      </group>

      {/* Right Cerebral Hemisphere */}
      <group position={[0.13, 0, 0]}>
        {/* Main frontal/parietal lobe */}
        <mesh position={[0, 0.04, 0.02]} scale={[0.22, 0.28, 0.36]}>
          <sphereGeometry args={[1, 32, 24]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={hovered}
            wireframe={wireframe}
          />
        </mesh>
        {/* Temporal lobe prominence */}
        <mesh position={[0.07, -0.09, 0.04]} scale={[0.13, 0.12, 0.2]}>
          <sphereGeometry args={[1, 20, 16]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={hovered}
            wireframe={wireframe}
          />
        </mesh>
        {/* Occipital lobe posterior curve */}
        <mesh position={[0, -0.05, -0.16]} scale={[0.17, 0.16, 0.18]}>
          <sphereGeometry args={[1, 20, 16]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={hovered}
            wireframe={wireframe}
          />
        </mesh>
      </group>

      {/* Longitudinal Cerebral Fissure Line */}
      <mesh position={[0, 0.06, 0.02]} scale={[0.015, 0.25, 0.38]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#38bdf8" opacity={0.25} transparent />
      </mesh>

      {/* Cerebellum (posterior base) */}
      <mesh position={[0, -0.22, -0.14]} scale={[0.26, 0.14, 0.18]}>
        <sphereGeometry args={[1, 24, 16]} />
        <OrganGlowMaterial
          organState={organState}
          isSelected={isSelected}
          isHovered={hovered}
        />
      </mesh>

      {/* Brainstem (Midbrain, Pons & Medulla) */}
      <mesh position={[0, -0.32, -0.02]} rotation={[0.1, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.045, 0.22, 16]} />
        <OrganGlowMaterial
          organState={organState}
          isSelected={isSelected}
          isHovered={hovered}
        />
      </mesh>

      {/* 3D Floating Status Badge */}
      {(hovered || isSelected || showLabels) && (
        <Html position={[0, 0.42, 0]} center distanceFactor={12}>
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
              <span className="font-semibold tracking-wide">BRAIN (CNS)</span>
              <span className="text-neutral-400 font-mono">
                {((organState?.stressLevel ?? 0) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
