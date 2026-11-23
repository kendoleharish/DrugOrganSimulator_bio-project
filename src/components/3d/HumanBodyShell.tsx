import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Species } from '../../engine/types';

interface HumanBodyShellProps {
  visible: boolean;
  opacity?: number;
  species?: Species;
}

export const HumanBodyShell: React.FC<HumanBodyShellProps> = ({
  visible,
  opacity = 0.16,
  species = 'human'
}) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // BioDigital Translucent Holographic Silhouette Shader
  const holographicMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color(species === 'rodent' ? '#f59e0b' : '#38bdf8') }, // Medical Cyan / Rodent Amber
        uRimColor: { value: new THREE.Color(species === 'rodent' ? '#d97706' : '#0284c7') },
        uOpacity: { value: opacity },
        uTime: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          vec4 mvPosition = viewMatrix * worldPos;
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uRimColor;
        uniform float uOpacity;
        uniform float uTime;
        
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;
        
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          
          // Enhanced Fresnel edge rim glow
          float fresnel = 1.0 - abs(dot(viewDir, normal));
          fresnel = pow(fresnel, 2.4);
          
          // Smooth sweeping medical scanline
          float scan = sin(vWorldPosition.y * 28.0 - uTime * 2.5) * 0.08 + 0.92;
          
          // Subtle cybernetic bio-grid micro-dots
          float grid = sin(vWorldPosition.x * 60.0) * sin(vWorldPosition.z * 60.0);
          float dots = smoothstep(0.7, 0.95, grid) * 0.15;
          
          vec3 finalColor = mix(uColor, uRimColor, fresnel * 0.75);
          float alpha = (fresnel * 0.72 + dots + 0.07) * uOpacity * scan;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `
    });
  }, [opacity, species]);

  // Animate scanline in shader
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  if (!visible) return null;

  // Render Rodent (Mouse Model) if selected
  if (species === 'rodent') {
    return (
      <group name="rodent-anatomical-shell" position={[0, 0.85, 0]} scale={[1.4, 1.4, 1.4]}>
        {/* Rodent Cranium & Snout */}
        <mesh position={[0, 0.35, 0.22]} rotation={[0.4, 0, 0]} material={holographicMaterial}>
          <coneGeometry args={[0.08, 0.22, 20]} />
        </mesh>
        <mesh position={[0, 0.42, 0.12]} material={holographicMaterial}>
          <sphereGeometry args={[0.11, 24, 20]} />
        </mesh>
        
        {/* Rodent Ears (Left & Right) */}
        <mesh position={[-0.10, 0.50, 0.08]} rotation={[-0.2, 0, -0.4]} material={holographicMaterial}>
          <cylinderGeometry args={[0.045, 0.01, 0.01, 16]} />
        </mesh>
        <mesh position={[0.10, 0.50, 0.08]} rotation={[-0.2, 0, 0.4]} material={holographicMaterial}>
          <cylinderGeometry args={[0.045, 0.01, 0.01, 16]} />
        </mesh>

        {/* Arched Murine Kyphotic Spine & Torso */}
        <mesh position={[0, 0.22, 0.02]} rotation={[0.3, 0, 0]} scale={[1.1, 1.3, 0.9]} material={holographicMaterial}>
          <capsuleGeometry args={[0.16, 0.32, 16, 20]} />
        </mesh>

        {/* Rodent Abdomen & Pelvic Bulk */}
        <mesh position={[0, -0.05, -0.04]} rotation={[-0.15, 0, 0]} scale={[1.2, 1.1, 1.0]} material={holographicMaterial}>
          <sphereGeometry args={[0.22, 24, 20]} />
        </mesh>

        {/* Forelimbs */}
        <mesh position={[-0.15, 0.10, 0.15]} rotation={[0.5, 0, 0.3]} material={holographicMaterial}>
          <capsuleGeometry args={[0.035, 0.18, 12, 14]} />
        </mesh>
        <mesh position={[0.15, 0.10, 0.15]} rotation={[0.5, 0, -0.3]} material={holographicMaterial}>
          <capsuleGeometry args={[0.035, 0.18, 12, 14]} />
        </mesh>

        {/* Crouched Hindlimbs */}
        <mesh position={[-0.18, -0.15, -0.08]} rotation={[-0.4, 0, 0.2]} material={holographicMaterial}>
          <capsuleGeometry args={[0.065, 0.22, 14, 16]} />
        </mesh>
        <mesh position={[0.18, -0.15, -0.08]} rotation={[-0.4, 0, -0.2]} material={holographicMaterial}>
          <capsuleGeometry args={[0.065, 0.22, 14, 16]} />
        </mesh>

        {/* Tapered Murine Caudal Tail */}
        <mesh position={[0, -0.18, -0.32]} rotation={[-0.7, 0, 0]} material={holographicMaterial}>
          <cylinderGeometry args={[0.012, 0.03, 0.45, 14]} />
        </mesh>
      </group>
    );
  }

  // High-Fidelity BioDigital Human Anatomical Silhouette
  return (
    <group name="human-anatomical-shell">
      {/* Cranium & Cranial Vault */}
      <mesh position={[0, 1.96, -0.01]} scale={[0.96, 1.08, 1.06]} material={holographicMaterial}>
        <sphereGeometry args={[0.17, 36, 28]} />
      </mesh>
      
      {/* Facial Contour & Brow / Zygomatic cheekbones */}
      <mesh position={[0, 1.88, 0.07]} scale={[1.05, 0.85, 0.9]} material={holographicMaterial}>
        <sphereGeometry args={[0.12, 28, 20]} />
      </mesh>

      {/* Jawline & Mandible */}
      <mesh position={[0, 1.78, 0.05]} rotation={[0.22, 0, 0]} material={holographicMaterial}>
        <coneGeometry args={[0.11, 0.17, 24]} />
      </mesh>

      {/* Neck & Larynx / Thyroid notch */}
      <mesh position={[0, 1.68, 0.01]} rotation={[-0.05, 0, 0]} material={holographicMaterial}>
        <cylinderGeometry args={[0.085, 0.105, 0.18, 24]} />
      </mesh>

      {/* Trapezius & Clavicular Shoulder Girdle */}
      <mesh position={[0, 1.55, 0]} scale={[1.35, 0.8, 0.9]} material={holographicMaterial}>
        <capsuleGeometry args={[0.14, 0.38, 16, 24]} />
      </mesh>

      {/* Deltoid Shoulders (Bilateral) */}
      <mesh position={[-0.38, 1.48, 0]} rotation={[0, 0, 0.2]} material={holographicMaterial}>
        <sphereGeometry args={[0.09, 20, 16]} />
      </mesh>
      <mesh position={[0.38, 1.48, 0]} rotation={[0, 0, -0.2]} material={holographicMaterial}>
        <sphereGeometry args={[0.09, 20, 16]} />
      </mesh>

      {/* Thorax / Pectoral Girdle & Ribcage Volume */}
      <mesh position={[0, 1.28, 0.03]} scale={[1.22, 1.05, 0.86]} material={holographicMaterial}>
        <sphereGeometry args={[0.29, 36, 28]} />
      </mesh>

      {/* Anterior Pectoral Muscular Contours (Left & Right) */}
      <mesh position={[-0.10, 1.34, 0.15]} scale={[1.1, 0.85, 0.6]} rotation={[0.1, 0, 0.1]} material={holographicMaterial}>
        <sphereGeometry args={[0.10, 20, 16]} />
      </mesh>
      <mesh position={[0.10, 1.34, 0.15]} scale={[1.1, 0.85, 0.6]} rotation={[0.1, 0, -0.1]} material={holographicMaterial}>
        <sphereGeometry args={[0.10, 20, 16]} />
      </mesh>

      {/* Abdominal Wall & Tapered Waist */}
      <mesh position={[0, 0.92, 0.01]} scale={[1.05, 1.15, 0.78]} material={holographicMaterial}>
        <cylinderGeometry args={[0.23, 0.25, 0.44, 28]} />
      </mesh>

      {/* Pelvis, Iliac Crests & Gluteal Mass */}
      <mesh position={[0, 0.58, -0.01]} scale={[1.18, 0.95, 0.88]} material={holographicMaterial}>
        <sphereGeometry args={[0.28, 32, 24]} />
      </mesh>

      {/* Arms: Brachium (Biceps/Triceps) */}
      <mesh position={[-0.43, 1.22, 0]} rotation={[0, 0, 0.12]} material={holographicMaterial}>
        <capsuleGeometry args={[0.065, 0.40, 16, 16]} />
      </mesh>
      <mesh position={[0.43, 1.22, 0]} rotation={[0, 0, -0.12]} material={holographicMaterial}>
        <capsuleGeometry args={[0.065, 0.40, 16, 16]} />
      </mesh>

      {/* Elbows */}
      <mesh position={[-0.48, 0.96, 0.01]} material={holographicMaterial}>
        <sphereGeometry args={[0.052, 16, 14]} />
      </mesh>
      <mesh position={[0.48, 0.96, 0.01]} material={holographicMaterial}>
        <sphereGeometry args={[0.052, 16, 14]} />
      </mesh>

      {/* Forearms (Antebrachium) */}
      <mesh position={[-0.53, 0.70, 0.03]} rotation={[0.06, 0, 0.08]} material={holographicMaterial}>
        <capsuleGeometry args={[0.052, 0.42, 16, 16]} />
      </mesh>
      <mesh position={[0.53, 0.70, 0.03]} rotation={[0.06, 0, -0.08]} material={holographicMaterial}>
        <capsuleGeometry args={[0.052, 0.42, 16, 16]} />
      </mesh>

      {/* Hands */}
      <mesh position={[-0.56, 0.42, 0.04]} rotation={[0.1, 0, 0.05]} material={holographicMaterial}>
        <boxGeometry args={[0.04, 0.14, 0.075]} />
      </mesh>
      <mesh position={[0.56, 0.42, 0.04]} rotation={[0.1, 0, -0.05]} material={holographicMaterial}>
        <boxGeometry args={[0.04, 0.14, 0.075]} />
      </mesh>

      {/* Thighs (Quadriceps & Hamstrings) */}
      <mesh position={[-0.18, 0.08, 0.01]} rotation={[-0.02, 0, -0.04]} material={holographicMaterial}>
        <capsuleGeometry args={[0.105, 0.65, 16, 20]} />
      </mesh>
      <mesh position={[0.18, 0.08, 0.01]} rotation={[-0.02, 0, 0.04]} material={holographicMaterial}>
        <capsuleGeometry args={[0.105, 0.65, 16, 20]} />
      </mesh>

      {/* Knees & Patellae */}
      <mesh position={[-0.19, -0.36, 0.04]} material={holographicMaterial}>
        <sphereGeometry args={[0.062, 18, 16]} />
      </mesh>
      <mesh position={[0.19, -0.36, 0.04]} material={holographicMaterial}>
        <sphereGeometry args={[0.062, 18, 16]} />
      </mesh>

      {/* Calves & Lower Legs (Gastrocnemius / Tibia) */}
      <mesh position={[-0.19, -0.80, 0.01]} rotation={[0.03, 0, -0.02]} material={holographicMaterial}>
        <capsuleGeometry args={[0.076, 0.72, 16, 20]} />
      </mesh>
      <mesh position={[0.19, -0.80, 0.01]} rotation={[0.03, 0, 0.02]} material={holographicMaterial}>
        <capsuleGeometry args={[0.076, 0.72, 16, 20]} />
      </mesh>

      {/* Feet & Ankles */}
      <mesh position={[-0.19, -1.24, 0.08]} rotation={[0.1, 0, 0]} material={holographicMaterial}>
        <boxGeometry args={[0.08, 0.07, 0.22]} />
      </mesh>
      <mesh position={[0.19, -1.24, 0.08]} rotation={[0.1, 0, 0]} material={holographicMaterial}>
        <boxGeometry args={[0.08, 0.07, 0.22]} />
      </mesh>
    </group>
  );
};
