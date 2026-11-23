import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { OrganState } from '../../../engine/types';
import { OrganGlowMaterial, WarningHaloHull } from '../OrganGlowMaterial';
import { Html } from '@react-three/drei';

interface HeartMeshProps {
  organState: OrganState;
  isSelected: boolean;
  onSelect: () => void;
  showLabels?: boolean;
  wireframe?: boolean;
}

export const HeartMesh: React.FC<HeartMeshProps> = ({
  organState,
  isSelected,
  onSelect,
  showLabels = true,
  wireframe = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const heartBodyRef = useRef<THREE.Group>(null);
  const pulsePhase = useRef(0);
  const [hovered, setHovered] = React.useState(false);

  // Anatomical Position: Mediastinum, slightly left of midline, tilted
  const position: [number, number, number] = [-0.14, 1.05, 0.14];

  // Animated cardiac pulse with continuous accumulated phase (no strobe on heart rate changes)
  useFrame((state, delta) => {
    if (!heartBodyRef.current) return;
    const time = state.clock.getElapsedTime();
    const stress = organState?.stressLevel ?? 0;

    // Heart rate speeds up with stress (tachycardia)
    const baseBpm = 72; // normal resting
    const currentBpm = baseBpm + stress * 55; // up to 127 bpm under stress
    const freq = (currentBpm / 60) * Math.PI * 2;

    // Continuous phase integration prevents phase jumps
    pulsePhase.current += delta * freq;

    // Dual-phase systolic/diastolic heartbeat waveform
    const beat =
      Math.sin(pulsePhase.current) * 0.05 +
      Math.sin(pulsePhase.current * 2 + 0.4) * 0.025;
    
    // Extra arrhythmia flutter if toxic
    const flutter = stress > 0.7 ? Math.sin(time * 28.0) * 0.02 : 0;

    const s = 1.0 + beat + flutter;
    heartBodyRef.current.scale.set(s, s * 1.02, s);
  });

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
      <group scale={[0.42, 0.45, 0.4]}>
        <WarningHaloHull stressLevel={organState?.stressLevel ?? 0} />
      </group>

      <group ref={heartBodyRef} rotation={[0.1, -0.15, -0.22]}>
        {/* Left Ventricle (Larger muscular cone forming apex) */}
        <mesh position={[-0.04, -0.06, 0.02]} rotation={[0, 0, 0.3]} scale={[0.16, 0.22, 0.16]}>
          <coneGeometry args={[1, 1.4, 24]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={hovered}
            wireframe={wireframe}
          />
        </mesh>

        {/* Right Ventricle (Anterior wall) */}
        <mesh position={[0.06, -0.04, 0.05]} rotation={[-0.1, 0.2, -0.2]} scale={[0.14, 0.2, 0.13]}>
          <coneGeometry args={[1, 1.2, 20]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={hovered}
            wireframe={wireframe}
          />
        </mesh>

        {/* Left Atrium (Upper chamber) */}
        <mesh position={[-0.06, 0.1, -0.03]} scale={[0.12, 0.11, 0.11]}>
          <sphereGeometry args={[1, 20, 16]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={hovered}
            wireframe={wireframe}
          />
        </mesh>

        {/* Right Atrium (Upper chamber) */}
        <mesh position={[0.08, 0.08, 0.02]} scale={[0.13, 0.12, 0.12]}>
          <sphereGeometry args={[1, 20, 16]} />
          <OrganGlowMaterial
            organState={organState}
            isSelected={isSelected}
            isHovered={hovered}
            wireframe={wireframe}
          />
        </mesh>

        {/* Aortic Arch (Curving up and over the heart) */}
        <mesh position={[-0.02, 0.18, 0.01]} rotation={[Math.PI / 2, 0, -0.3]}>
          <torusGeometry args={[0.09, 0.035, 16, 24, Math.PI * 0.8]} />
          <meshStandardMaterial
            color={organState?.colorState === 'toxic' ? '#ef4444' : '#f43f5e'}
            emissive={organState?.colorState === 'toxic' ? '#dc2626' : '#e11d48'}
            emissiveIntensity={0.5}
            roughness={0.2}
          />
        </mesh>

        {/* Pulmonary Trunk / Arteries */}
        <mesh position={[0.04, 0.16, 0.05]} rotation={[-0.2, 0.3, 0.4]}>
          <cylinderGeometry args={[0.032, 0.035, 0.14, 16]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.4}
            roughness={0.3}
          />
        </mesh>

        {/* Superior Vena Cava */}
        <mesh position={[0.13, 0.18, -0.02]}>
          <cylinderGeometry args={[0.03, 0.03, 0.16, 16]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.3}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* 3D Floating Status Badge */}
      {(hovered || isSelected || showLabels) && (
        <Html position={[0, 0.34, 0]} center distanceFactor={12}>
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
              <span className="font-semibold tracking-wide">HEART (CARDIO)</span>
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
