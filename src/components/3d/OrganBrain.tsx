import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { OrganState } from '../../engine/types';

interface OrganBrainProps {
  organState: OrganState;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  stressHeatmapVisible: boolean;
}

export const OrganBrain: React.FC<OrganBrainProps> = ({
  organState,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  stressHeatmapVisible
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const synapseParticlesRef = useRef<THREE.Points>(null);
  const [localHover, setLocalHover] = useState(false);

  // Generate wrinkled gyri / sulci cortical geometry for cerebrum hemispheres
  const hemisphereGeometries = useMemo(() => {
    const createHemisphereGeo = (isRight: boolean) => {
      const geo = new THREE.SphereGeometry(0.138, 48, 36);
      const pos = geo.attributes.position;
      
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);

        // Medial inter-hemispheric longitudinal fissure flattening
        if (isRight && x < 0.015) {
          x = Math.max(0.005, x * 0.18);
        } else if (!isRight && x > -0.015) {
          x = Math.min(-0.005, x * 0.18);
        }

        // Realistic procedural gyri & sulci folds (convoluted brain surface)
        const foldNoise = Math.sin(x * 52) * Math.cos(y * 48) * Math.sin(z * 56) +
                          Math.sin(x * 24 + z * 32) * 0.5;
        const displacement = 1.0 + foldNoise * 0.055;

        // Frontal lobe expansion, occipital taper
        const frontalSwell = z > 0 ? 1.08 : 0.96;

        pos.setXYZ(i, x * displacement, y * displacement * 1.04, z * displacement * frontalSwell);
      }

      geo.computeVertexNormals();
      return geo;
    };

    return {
      left: createHemisphereGeo(false),
      right: createHemisphereGeo(true)
    };
  }, []);

  // Cerebellum with horizontal folia striations
  const cerebellumGeometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.070, 36, 28);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Horizontal folial ridges
      const folia = Math.sin(y * 90.0) * 0.004;
      pos.setXYZ(i, x * 1.25 + folia, y * 0.8 + folia, z * 0.88 + folia);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  // Circle of Willis Arterial Ring at the base of the skull
  const circleOfWillisGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.09, 0.04),    // Anterior communicating artery
      new THREE.Vector3(0.025, -0.095, 0.02), // Right internal carotid
      new THREE.Vector3(0.02, -0.10, -0.02),  // Right posterior communicating
      new THREE.Vector3(0, -0.11, -0.04),    // Basilar bifurcation
      new THREE.Vector3(-0.02, -0.10, -0.02), // Left posterior communicating
      new THREE.Vector3(-0.025, -0.095, 0.02) // Left internal carotid
    ], true);
    return new THREE.TubeGeometry(curve, 28, 0.005, 8, true);
  }, []);

  // Neural Synaptic Impulse Particles
  const synapseData = useMemo(() => {
    const count = 75;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 0.11 + Math.random() * 0.04;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return { count, positions };
  }, []);

  // Compute dynamic color based on stress level and state
  const { organColor, emissiveColor, emissiveIntensity } = useMemo(() => {
    if (!stressHeatmapVisible) {
      return {
        organColor: new THREE.Color(isHovered || isSelected ? '#a5b4fc' : '#c7d2fe'),
        emissiveColor: new THREE.Color('#312e81'),
        emissiveIntensity: isHovered || isSelected ? 0.35 : 0.15
      };
    }

    if (organState.colorState === 'toxic' || organState.stressLevel > 0.6) {
      return {
        organColor: new THREE.Color('#ef4444'),
        emissiveColor: new THREE.Color('#b91c1c'),
        emissiveIntensity: 0.8
      };
    } else if (organState.colorState === 'stressed' || organState.stressLevel > 0.2) {
      return {
        organColor: new THREE.Color('#f59e0b'),
        emissiveColor: new THREE.Color('#b45309'),
        emissiveIntensity: 0.55
      };
    } else {
      // Healthy bio-cyan / neural teal
      return {
        organColor: new THREE.Color('#38bdf8'),
        emissiveColor: new THREE.Color('#0284c7'),
        emissiveIntensity: isHovered || isSelected ? 0.45 : 0.22
      };
    }
  }, [organState, isHovered, isSelected, stressHeatmapVisible]);

  // Subtle breathing / synaptic flash animation
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    
    const scalePulse = 1.0 + Math.sin(t * 1.8) * 0.009;
    const targetScale = isSelected ? 1.08 * scalePulse : isHovered ? 1.04 * scalePulse : scalePulse;
    
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

    // Synapse particles rotation
    if (synapseParticlesRef.current) {
      synapseParticlesRef.current.rotation.y = t * 0.3;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, 1.95, 0.02]}
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
      {/* Left Cerebral Hemisphere */}
      <mesh geometry={hemisphereGeometries.left} position={[-0.04, 0.02, 0]}>
        <meshStandardMaterial
          color={organColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.38}
          metalness={0.18}
        />
      </mesh>

      {/* Right Cerebral Hemisphere */}
      <mesh geometry={hemisphereGeometries.right} position={[0.04, 0.02, 0]}>
        <meshStandardMaterial
          color={organColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.38}
          metalness={0.18}
        />
      </mesh>

      {/* Cerebellum with horizontal folia striations */}
      <mesh geometry={cerebellumGeometry} position={[0, -0.078, -0.068]}>
        <meshStandardMaterial
          color={organColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity * 0.9}
          roughness={0.48}
        />
      </mesh>

      {/* Brainstem / Pons Bulge & Medulla Oblongata */}
      <group position={[0, -0.125, -0.02]} rotation={[0.08, 0, 0]}>
        {/* Pons Bulge */}
        <mesh position={[0, 0.02, 0.01]} scale={[1.2, 0.9, 1.1]}>
          <sphereGeometry args={[0.028, 16, 14]} />
          <meshStandardMaterial color={organColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity * 0.8} />
        </mesh>
        {/* Medulla Column */}
        <mesh position={[0, -0.03, 0]}>
          <cylinderGeometry args={[0.022, 0.018, 0.08, 16]} />
          <meshStandardMaterial color={organColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity * 0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Cerebrovascular Circle of Willis */}
      <mesh geometry={circleOfWillisGeometry}>
        <meshStandardMaterial color="#f43f5e" emissive="#be123c" emissiveIntensity={0.6} />
      </mesh>

      {/* Synaptic Neural Action Potentials Particles */}
      <points ref={synapseParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={synapseData.count}
            array={synapseData.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.012}
          color="#38bdf8"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Interactive Selection Highlight Ring */}
      {(isSelected || isHovered || localHover) && (
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.22, 0.23, 40]} />
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
