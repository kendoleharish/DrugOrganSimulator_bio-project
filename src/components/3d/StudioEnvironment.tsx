import React from 'react';
import * as THREE from 'three';

export const StudioEnvironment: React.FC = () => {
  return (
    <group name="medical-studio-environment">
      {/* Soft Ambient Clinical Illumination */}
      <ambientLight color="#f1f5f9" intensity={0.7} />

      {/* Primary Key Light (Upper Right Front) */}
      <directionalLight
        position={[3.5, 5.0, 4.0]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={3}
        shadow-camera-bottom={-1}
        shadow-bias={-0.0005}
      />

      {/* Secondary Fill Light (Left Front, softer to illuminate recesses) */}
      <directionalLight
        position={[-3.5, 3.0, 2.5]}
        intensity={0.65}
        color="#e2e8f0"
      />

      {/* Backlight / Rim Light (Upper Behind, outlines anatomical boundaries) */}
      <directionalLight
        position={[0, 4.5, -4.0]}
        intensity={0.85}
        color="#cbd5e1"
      />

      {/* Low Under-Light (illuminates underside of viscera) */}
      <directionalLight
        position={[0, -2.0, 2.0]}
        intensity={0.25}
        color="#94a3b8"
      />

      {/* Subtle Anatomical Ground Pedestal & Contact Shadow Plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[12, 12]} />
        <shadowMaterial opacity={0.35} />
      </mesh>

      {/* Minimalist Surgical Orientation Ring on Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.001, 0]}
      >
        <ringGeometry args={[0.55, 0.56, 64]} />
        <meshBasicMaterial color="#334155" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};
