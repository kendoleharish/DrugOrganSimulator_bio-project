import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { OrganKey, ORGAN_INFO_MAP } from '../../types/ui';
import { OrganState } from '../../engine/types';

interface OrganHoloTargetProps {
  selectedOrgan: OrganKey | null;
  organState: OrganState | null;
  visible: boolean;
}

export const OrganHoloTarget: React.FC<OrganHoloTargetProps> = ({
  selectedOrgan,
  organState,
  visible
}) => {
  const reticleRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!reticleRef.current) return;
    const t = state.clock.getElapsedTime();
    reticleRef.current.rotation.z = t * 0.8;
  });

  if (!visible || !selectedOrgan || !organState) return null;

  const info = ORGAN_INFO_MAP[selectedOrgan];
  if (!info) return null;

  const pos = info.position;
  const stressPercent = Math.round(organState.stressLevel * 100);

  const badgeColor =
    organState.colorState === 'toxic'
      ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
      : organState.colorState === 'stressed'
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
      : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';

  return (
    <group position={pos}>
      {/* 3D Rotating Target Reticle */}
      <group ref={reticleRef}>
        <mesh>
          <ringGeometry args={[0.18, 0.185, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
          <mesh key={idx} rotation={[0, 0, angle]} position={[0.2, 0, 0]}>
            <planeGeometry args={[0.04, 0.006]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
          </mesh>
        ))}
      </group>

      {/* Floating 3D HTML Leader Tag */}
      <Html position={[0.26, 0.12, 0]} center distanceFactor={4} zIndexRange={[100, 0]}>
        <div className="pointer-events-none flex items-center space-x-2 whitespace-nowrap">
          {/* Connector line indicator */}
          <div className="h-[1px] w-6 bg-cyan-400/80 shadow-[0_0_8px_#38bdf8]" />
          
          <div className="rounded-lg border border-cyan-500/40 bg-slate-950/90 px-3 py-1.5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full animate-ping bg-cyan-400" />
              <span className="text-xs font-bold tracking-wider text-slate-100 uppercase">
                {info.name}
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${badgeColor}`}>
                {stressPercent}% STRESS
              </span>
            </div>
            <div className="mt-0.5 text-[10px] text-slate-400 font-mono">
              [CONC: {organState.concentration.toFixed(2)} mg/L]
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};
