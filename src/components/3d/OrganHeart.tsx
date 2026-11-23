import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { OrganState } from '../../engine/types';

interface OrganHeartProps {
  organState: OrganState;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  stressHeatmapVisible: boolean;
}

export const OrganHeart: React.FC<OrganHeartProps> = ({
  organState,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  stressHeatmapVisible
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [localHover, setLocalHover] = useState(false);

  // Dynamic colors & beat rate based on organ stress
  const { organColor, emissiveColor, emissiveIntensity, beatSpeed } = useMemo(() => {
    let speed = 1.2; // 72 bpm baseline
    let oColor = new THREE.Color('#f43f5e'); // ruby heart
    let eColor = new THREE.Color('#9f1239');
    let eIntensity = 0.3;

    if (!stressHeatmapVisible) {
      return {
        organColor: new THREE.Color(isHovered || isSelected ? '#fb7185' : '#e11d48'),
        emissiveColor: new THREE.Color('#881337'),
        emissiveIntensity: isHovered || isSelected ? 0.45 : 0.25,
        beatSpeed: 1.2
      };
    }

    if (organState.colorState === 'toxic' || organState.stressLevel > 0.6) {
      oColor = new THREE.Color('#ef4444');
      eColor = new THREE.Color('#991b1b');
      eIntensity = 0.88;
      speed = 2.6; // Severe tachycardia / cardiotoxic arrhythmia
    } else if (organState.colorState === 'stressed' || organState.stressLevel > 0.2) {
      oColor = new THREE.Color('#f59e0b');
      eColor = new THREE.Color('#b45309');
      eIntensity = 0.58;
      speed = 1.8; // Mild tachycardia
    } else {
      oColor = new THREE.Color('#06b6d4'); // Healthy bio-cyan / myocardial emerald
      eColor = new THREE.Color('#0e7490');
      eIntensity = isHovered || isSelected ? 0.45 : 0.22;
      speed = 1.2;
    }

    return {
      organColor: oColor,
      emissiveColor: eColor,
      emissiveIntensity: eIntensity,
      beatSpeed: speed
    };
  }, [organState, isHovered, isSelected, stressHeatmapVisible]);

  // Real-time cardiac systolic-diastolic contraction with twisting deformation
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Heart contraction: Sharp systole followed by gentle diastolic filling
    const phase = (t * beatSpeed * 2.2) % (Math.PI * 2);
    let beat = Math.sin(phase);
    if (beat > 0) {
      beat = Math.pow(beat, 2.8); // Vigorous systolic stroke
    } else {
      beat = -Math.pow(Math.abs(beat), 1.3) * 0.38; // Gentle diastolic rebound
    }

    // Arrhythmia tremor under toxic cardiotoxicity
    const arrhythmiaJitter = organState.colorState === 'toxic' ? (Math.sin(t * 30.0) * 0.015) : 0;

    const contraction = 1.0 + (beat * 0.09) + arrhythmiaJitter;
    const baseScale = isSelected ? 1.12 : isHovered || localHover ? 1.06 : 1.0;
    const finalScale = baseScale * contraction;

    // Cardiac torsion: apex twists ~5 degrees during systole
    groupRef.current.scale.set(finalScale, finalScale * (1.0 - beat * 0.04), finalScale);
    groupRef.current.rotation.y = 0.18 + beat * 0.08;
  });

  // Coronary Vessels curves (Left Anterior Descending - LAD artery across anterior wall)
  const coronaryLAD = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.01, 0.05, 0.05),
      new THREE.Vector3(-0.02, 0.01, 0.065),
      new THREE.Vector3(-0.04, -0.04, 0.05),
      new THREE.Vector3(-0.05, -0.09, 0.02)
    ]);
    return new THREE.TubeGeometry(curve, 18, 0.0045, 8, false);
  }, []);

  // Circumflex coronary artery
  const coronaryCircumflex = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.01, 0.05, 0.04),
      new THREE.Vector3(0.04, 0.03, 0.03),
      new THREE.Vector3(0.06, -0.01, 0.0)
    ]);
    return new THREE.TubeGeometry(curve, 14, 0.0038, 8, false);
  }, []);

  return (
    <group
      ref={groupRef}
      position={[-0.12, 1.18, 0.05]}
      rotation={[0.12, 0.18, -0.16]}
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
      {/* Left Ventricle (Thick Muscular Apex) */}
      <mesh position={[-0.02, -0.05, 0]} rotation={[0.22, 0, -0.22]}>
        <coneGeometry args={[0.078, 0.15, 24]} />
        <meshStandardMaterial
          color={organColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.32}
          metalness={0.18}
        />
      </mesh>

      {/* Right Ventricle (Antero-inferior muscular bulk) */}
      <mesh position={[0.04, -0.01, 0.02]} scale={[0.88, 0.92, 0.78]}>
        <sphereGeometry args={[0.068, 24, 20]} />
        <meshStandardMaterial
          color={organColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.32}
        />
      </mesh>

      {/* Left Atrium & Auricle (Superior chamber) */}
      <mesh position={[-0.04, 0.05, -0.01]} scale={[0.92, 0.78, 0.82]}>
        <sphereGeometry args={[0.052, 20, 16]} />
        <meshStandardMaterial
          color={organColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity * 0.9}
          roughness={0.38}
        />
      </mesh>

      {/* Right Atrium (Receiving vena cava) */}
      <mesh position={[0.045, 0.055, 0.0]}>
        <sphereGeometry args={[0.048, 20, 16]} />
        <meshStandardMaterial
          color={organColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity * 0.9}
          roughness={0.38}
        />
      </mesh>

      {/* Ascending Aorta & Aortic Arch Trunk */}
      <mesh position={[-0.01, 0.09, 0.0]} rotation={[-0.1, 0, 0.15]}>
        <cylinderGeometry args={[0.024, 0.026, 0.08, 18]} />
        <meshStandardMaterial
          color="#f43f5e"
          emissive="#be123c"
          emissiveIntensity={0.5}
          roughness={0.25}
        />
      </mesh>

      {/* 3 Major Aortic Arch Branch Arteries */}
      {/* 1. Brachiocephalic Artery */}
      <mesh position={[0.01, 0.14, 0.0]} rotation={[0.1, 0, 0.15]}>
        <cylinderGeometry args={[0.007, 0.007, 0.035, 12]} />
        <meshStandardMaterial color="#f43f5e" emissive="#be123c" emissiveIntensity={0.5} />
      </mesh>
      {/* 2. Left Common Carotid Artery */}
      <mesh position={[-0.01, 0.145, 0.01]} rotation={[0, 0, 0.05]}>
        <cylinderGeometry args={[0.006, 0.006, 0.035, 12]} />
        <meshStandardMaterial color="#f43f5e" emissive="#be123c" emissiveIntensity={0.5} />
      </mesh>
      {/* 3. Left Subclavian Artery */}
      <mesh position={[-0.03, 0.14, 0.01]} rotation={[-0.1, 0, -0.15]}>
        <cylinderGeometry args={[0.006, 0.006, 0.035, 12]} />
        <meshStandardMaterial color="#f43f5e" emissive="#be123c" emissiveIntensity={0.5} />
      </mesh>

      {/* Pulmonary Trunk crossing over */}
      <mesh position={[0.028, 0.065, 0.035]} rotation={[0.38, 0.22, -0.28]}>
        <cylinderGeometry args={[0.020, 0.022, 0.07, 16]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive="#0369a1"
          emissiveIntensity={0.5}
          roughness={0.28}
        />
      </mesh>

      {/* Superior Vena Cava */}
      <mesh position={[0.055, 0.10, -0.01]} rotation={[0.05, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.055, 14]} />
        <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.4} />
      </mesh>

      {/* Surface Coronary Arteries (LAD & Circumflex) */}
      <mesh geometry={coronaryLAD}>
        <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={0.7} />
      </mesh>
      <mesh geometry={coronaryCircumflex}>
        <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={0.7} />
      </mesh>

      {/* Selection Holographic Reticle */}
      {(isSelected || isHovered || localHover) && (
        <mesh position={[0, -0.01, 0]}>
          <ringGeometry args={[0.16, 0.17, 36]} />
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
