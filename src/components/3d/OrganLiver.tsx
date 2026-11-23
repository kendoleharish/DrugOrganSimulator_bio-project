import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { OrganState } from '../../engine/types';

interface OrganLiverProps {
  organState: OrganState;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  stressHeatmapVisible: boolean;
}

export const OrganLiver: React.FC<OrganLiverProps> = ({
  organState,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  stressHeatmapVisible
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const napqiParticlesRef = useRef<THREE.Points>(null);
  const [localHover, setLocalHover] = useState(false);

  // Procedural anatomical wedge shape for the liver
  const liverGeometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.165, 44, 34);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Anatomical liver asymmetry:
      // Bulky convex right lobe (x > 0)
      // Thin tapering left lobe (x < 0)
      if (x < 0) {
        x *= 0.72;
        y *= 0.68;
      } else {
        x *= 1.28;
      }

      // Superior diaphragmatic dome (convex fit against diaphragm)
      if (y > 0) {
        y *= 0.92;
      } else {
        // Flattened visceral inferior surface with impressions
        y *= 0.62;
        if (z < 0) {
          z *= 0.68; // Posterior inferior border
        }
      }

      // Falciform ligament indentation notch near x = -0.02
      if (Math.abs(x + 0.02) < 0.04 && y > -0.05) {
        z -= 0.012;
      }

      pos.setXYZ(i, x, y, z);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  // Falciform ligament dividing right and left lobes
  const falciformLigamentGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.02, 0.12, 0.06),
      new THREE.Vector3(-0.02, 0.05, 0.12),
      new THREE.Vector3(-0.02, -0.04, 0.10),
      new THREE.Vector3(-0.02, -0.09, 0.04)
    ]);
    return new THREE.TubeGeometry(curve, 16, 0.005, 6, false);
  }, []);

  // Reactive Toxic Metabolite (NAPQI) Particles emitted when GSH is depleted
  const napqiData = useMemo(() => {
    const count = 60;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.28;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.16;
    }
    return { count, positions };
  }, []);

  // Compute dynamic color & GSH feedback
  const { organColor, emissiveColor, emissiveIntensity, isToxicGSH } = useMemo(() => {
    if (!stressHeatmapVisible) {
      return {
        organColor: new THREE.Color(isHovered || isSelected ? '#a78bfa' : '#8b5cf6'),
        emissiveColor: new THREE.Color('#5b21b6'),
        emissiveIntensity: isHovered || isSelected ? 0.35 : 0.15,
        isToxicGSH: false
      };
    }

    // Liver specific: If GSH is depleted below 25% or NAPQI is active, severe toxic state
    const toxicGSH = organState.glutathioneReservePct !== undefined && organState.glutathioneReservePct < 25;
    const isToxic = organState.colorState === 'toxic' || organState.stressLevel > 0.6 || toxicGSH;
    const isStressed = organState.colorState === 'stressed' || organState.stressLevel > 0.2 || (organState.glutathioneReservePct !== undefined && organState.glutathioneReservePct < 60);

    if (isToxic) {
      return {
        organColor: new THREE.Color('#ef4444'),
        emissiveColor: new THREE.Color('#991b1b'),
        emissiveIntensity: 0.85,
        isToxicGSH: true
      };
    } else if (isStressed) {
      return {
        organColor: new THREE.Color('#f59e0b'),
        emissiveColor: new THREE.Color('#b45309'),
        emissiveIntensity: 0.55,
        isToxicGSH: false
      };
    } else {
      return {
        organColor: new THREE.Color('#10b981'), // Healthy emerald / hepatic green
        emissiveColor: new THREE.Color('#065f46'),
        emissiveIntensity: isHovered || isSelected ? 0.45 : 0.22,
        isToxicGSH: false
      };
    }
  }, [organState, isHovered, isSelected, stressHeatmapVisible]);

  // Gentle metabolic pulsation & NAPQI particle float
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const pulse = 1.0 + Math.sin(t * 1.5) * 0.008;
    const baseScale = isSelected ? 1.09 : isHovered || localHover ? 1.05 : 1.0;
    const finalScale = baseScale * pulse;
    groupRef.current.scale.lerp(new THREE.Vector3(finalScale, finalScale, finalScale), 0.1);

    if (napqiParticlesRef.current && isToxicGSH) {
      napqiParticlesRef.current.rotation.y = t * 0.5;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0.32, 0.82, 0.08]}
      rotation={[-0.1, -0.2, 0.1]}
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
      {/* Primary Liver Parenchyma (Right & Left Lobes) */}
      <mesh geometry={liverGeometry}>
        <meshStandardMaterial
          color={organColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.38}
          metalness={0.16}
        />
      </mesh>

      {/* Falciform Ligament dividing the lobes */}
      <mesh geometry={falciformLigamentGeometry}>
        <meshStandardMaterial color="#cbd5e1" transparent opacity={0.65} roughness={0.3} />
      </mesh>

      {/* Gallbladder Nestling in Inferior Visceral Notch */}
      <mesh position={[0.08, -0.075, 0.065]} scale={[0.72, 1.25, 0.72]} rotation={[0.2, 0.1, -0.3]}>
        <sphereGeometry args={[0.028, 20, 18]} />
        <meshStandardMaterial
          color="#84cc16"
          emissive="#4d7c0f"
          emissiveIntensity={0.35}
          roughness={0.28}
        />
      </mesh>

      {/* Cystic Duct & Common Bile Duct */}
      <mesh position={[0.05, -0.05, 0.03]} rotation={[0.4, 0.2, 0]}>
        <cylinderGeometry args={[0.005, 0.006, 0.045, 10]} />
        <meshStandardMaterial color="#65a30d" roughness={0.3} />
      </mesh>

      {/* Hepatic Portal Triad entering Hilum (Portal Vein & Hepatic Artery) */}
      <mesh position={[-0.01, -0.055, -0.03]} rotation={[0.4, 0.3, 0]}>
        <cylinderGeometry args={[0.014, 0.016, 0.055, 14]} />
        <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0.015, -0.05, -0.025]} rotation={[0.35, 0.2, 0]}>
        <cylinderGeometry args={[0.009, 0.010, 0.05, 12]} />
        <meshStandardMaterial color="#f43f5e" emissive="#be123c" emissiveIntensity={0.5} roughness={0.3} />
      </mesh>

      {/* Inferior Vena Cava Fossa / Conduit Posteriorly */}
      <mesh position={[-0.03, 0.02, -0.08]} rotation={[0.1, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.020, 0.16, 14]} />
        <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.5} roughness={0.3} />
      </mesh>

      {/* Reactive Toxic Metabolite (NAPQI) Particle Cloud when GSH is depleted */}
      {isToxicGSH && (
        <points ref={napqiParticlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={napqiData.count}
              array={napqiData.positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.016}
            color="#fb7185"
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* Selection Holographic Reticle */}
      {(isSelected || isHovered || localHover) && (
        <mesh position={[0.05, 0, 0]}>
          <ringGeometry args={[0.22, 0.23, 36]} />
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
