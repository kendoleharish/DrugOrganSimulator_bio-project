import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface VascularSystemProps {
  visible: boolean;
  particlesVisible: boolean;
  flowSpeedMultiplier?: number;
}

export const VascularSystem: React.FC<VascularSystemProps> = ({
  visible,
  particlesVisible,
  flowSpeedMultiplier = 1.0
}) => {
  const particlesRef = useRef<THREE.Points>(null);

  // Generate vascular conduits connecting heart to brain, upper limbs, viscera, and lower limbs
  const vascularPaths = useMemo(() => {
    // 1. Aorta -> Carotid artery to brain
    const aortaToBrain = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, 1.25, 0.04),
      new THREE.Vector3(-0.04, 1.40, 0.05),
      new THREE.Vector3(-0.02, 1.58, 0.02),
      new THREE.Vector3(0.0, 1.74, 0.02),
      new THREE.Vector3(0.0, 1.94, 0.02)
    ]);

    // 2. Aortic Arch -> Left Subclavian & Brachial Artery (Left Arm)
    const aortaToLeftArm = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, 1.25, 0.04),
      new THREE.Vector3(-0.16, 1.45, 0.02),
      new THREE.Vector3(-0.35, 1.40, 0.0),
      new THREE.Vector3(-0.44, 1.15, 0.01),
      new THREE.Vector3(-0.52, 0.70, 0.03)
    ]);

    // 3. Aortic Arch -> Right Subclavian & Brachial Artery (Right Arm)
    const aortaToRightArm = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, 1.25, 0.04),
      new THREE.Vector3(0.08, 1.45, 0.02),
      new THREE.Vector3(0.35, 1.40, 0.0),
      new THREE.Vector3(0.44, 1.15, 0.01),
      new THREE.Vector3(0.52, 0.70, 0.03)
    ]);

    // 4. Descending thoracic aorta -> celiac trunk -> stomach
    const aortaToStomach = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, 1.25, 0.04),
      new THREE.Vector3(-0.04, 1.10, -0.01),
      new THREE.Vector3(-0.06, 0.95, -0.02),
      new THREE.Vector3(-0.16, 0.85, 0.04),
      new THREE.Vector3(-0.22, 0.78, 0.08)
    ]);

    // 5. Descending aorta -> hepatic artery -> liver
    const aortaToLiver = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, 1.25, 0.04),
      new THREE.Vector3(-0.04, 1.10, -0.01),
      new THREE.Vector3(0.02, 0.92, 0.01),
      new THREE.Vector3(0.18, 0.86, 0.06),
      new THREE.Vector3(0.32, 0.82, 0.08)
    ]);

    // 6. Descending aorta -> left renal artery -> left kidney
    const aortaToLeftKidney = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, 0.90, -0.02),
      new THREE.Vector3(-0.05, 0.65, -0.03),
      new THREE.Vector3(-0.12, 0.56, -0.07),
      new THREE.Vector3(-0.20, 0.54, -0.08)
    ]);

    // 7. Descending aorta -> right renal artery -> right kidney
    const aortaToRightKidney = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, 0.90, -0.02),
      new THREE.Vector3(0.0, 0.65, -0.03),
      new THREE.Vector3(0.10, 0.56, -0.07),
      new THREE.Vector3(0.20, 0.51, -0.08)
    ]);

    // 8. Abdominal aorta bifurcation -> Left Iliac & Femoral Artery (Left Leg)
    const aortaToLeftLeg = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, 0.65, -0.03),
      new THREE.Vector3(-0.08, 0.45, -0.02),
      new THREE.Vector3(-0.15, 0.20, 0.01),
      new THREE.Vector3(-0.18, -0.35, 0.02),
      new THREE.Vector3(-0.19, -0.80, 0.01)
    ]);

    // 9. Abdominal aorta bifurcation -> Right Iliac & Femoral Artery (Right Leg)
    const aortaToRightLeg = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, 0.65, -0.03),
      new THREE.Vector3(0.04, 0.45, -0.02),
      new THREE.Vector3(0.12, 0.20, 0.01),
      new THREE.Vector3(0.18, -0.35, 0.02),
      new THREE.Vector3(0.19, -0.80, 0.01)
    ]);

    // 10. Inferior Vena Cava (IVC) return to right atrium
    const inferiorVenaCava = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.40, -0.01),
      new THREE.Vector3(0.03, 0.62, -0.01),
      new THREE.Vector3(0.05, 0.85, 0.02),
      new THREE.Vector3(0.04, 1.08, 0.04),
      new THREE.Vector3(-0.05, 1.20, 0.05)
    ]);

    // 11. Superior Vena Cava (SVC) cranial jugular venous return
    const superiorVenaCava = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 1.85, 0.01),
      new THREE.Vector3(0.02, 1.60, 0.02),
      new THREE.Vector3(0.04, 1.38, 0.03),
      new THREE.Vector3(-0.05, 1.22, 0.05)
    ]);

    return {
      aortaToBrain,
      aortaToLeftArm,
      aortaToRightArm,
      aortaToStomach,
      aortaToLiver,
      aortaToLeftKidney,
      aortaToRightKidney,
      aortaToLeftLeg,
      aortaToRightLeg,
      inferiorVenaCava,
      superiorVenaCava
    };
  }, []);

  // Flowing blood cells particle data
  const particleData = useMemo(() => {
    const count = 480;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const progress = new Float32Array(count);
    const curveIndices = new Uint8Array(count);

    const arterialColor = new THREE.Color('#f43f5e'); // Oxygenated arterial ruby
    const venousColor = new THREE.Color('#06b6d4');   // Venous cyan/blue

    for (let i = 0; i < count; i++) {
      progress[i] = Math.random();
      // 11 curves total: 0-8 are arterial, 9-10 are venous
      const cIdx = i % 11;
      curveIndices[i] = cIdx;

      const isVenous = cIdx >= 9;
      const c = isVenous ? venousColor : arterialColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }

    return { count, positions, colors, progress, curveIndices };
  }, []);

  // Animate flowing blood particles along curves
  useFrame((_, delta) => {
    if (!particlesRef.current || !particlesVisible || !visible) return;

    const curves = [
      vascularPaths.aortaToBrain,
      vascularPaths.aortaToLeftArm,
      vascularPaths.aortaToRightArm,
      vascularPaths.aortaToStomach,
      vascularPaths.aortaToLiver,
      vascularPaths.aortaToLeftKidney,
      vascularPaths.aortaToRightKidney,
      vascularPaths.aortaToLeftLeg,
      vascularPaths.aortaToRightLeg,
      vascularPaths.inferiorVenaCava,
      vascularPaths.superiorVenaCava
    ];

    const posAttr = particlesRef.current.geometry.attributes.position;
    const baseSpeed = 0.28 * Math.max(0.2, flowSpeedMultiplier);

    for (let i = 0; i < particleData.count; i++) {
      particleData.progress[i] = (particleData.progress[i] + delta * baseSpeed * (0.85 + (i % 5) * 0.08)) % 1.0;
      const curve = curves[particleData.curveIndices[i]];
      const pt = curve.getPointAt(particleData.progress[i]);

      // Radial dispersion jitter within vascular lumen
      const jitter = 0.005;
      posAttr.setXYZ(
        i,
        pt.x + (Math.sin(i * 87) * jitter),
        pt.y + (Math.cos(i * 63) * jitter),
        pt.z + (Math.sin(i * 41) * jitter)
      );
    }

    posAttr.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <group name="vascular-system">
      {/* Arterial Conduits (Ruby / Red) */}
      <mesh>
        <tubeGeometry args={[vascularPaths.aortaToBrain, 36, 0.015, 8, false]} />
        <meshStandardMaterial
          color="#e11d48"
          emissive="#9f1239"
          emissiveIntensity={0.55}
          roughness={0.25}
          metalness={0.1}
          transparent
          opacity={0.88}
        />
      </mesh>

      <mesh>
        <tubeGeometry args={[vascularPaths.aortaToLeftArm, 28, 0.012, 8, false]} />
        <meshStandardMaterial color="#e11d48" emissive="#9f1239" emissiveIntensity={0.5} transparent opacity={0.85} />
      </mesh>
      <mesh>
        <tubeGeometry args={[vascularPaths.aortaToRightArm, 28, 0.012, 8, false]} />
        <meshStandardMaterial color="#e11d48" emissive="#9f1239" emissiveIntensity={0.5} transparent opacity={0.85} />
      </mesh>

      <mesh>
        <tubeGeometry args={[vascularPaths.aortaToStomach, 28, 0.014, 8, false]} />
        <meshStandardMaterial color="#e11d48" emissive="#9f1239" emissiveIntensity={0.5} transparent opacity={0.85} />
      </mesh>

      <mesh>
        <tubeGeometry args={[vascularPaths.aortaToLiver, 32, 0.017, 8, false]} />
        <meshStandardMaterial color="#e11d48" emissive="#9f1239" emissiveIntensity={0.5} transparent opacity={0.85} />
      </mesh>

      <mesh>
        <tubeGeometry args={[vascularPaths.aortaToLeftKidney, 24, 0.013, 8, false]} />
        <meshStandardMaterial color="#e11d48" emissive="#9f1239" emissiveIntensity={0.5} transparent opacity={0.85} />
      </mesh>
      <mesh>
        <tubeGeometry args={[vascularPaths.aortaToRightKidney, 24, 0.013, 8, false]} />
        <meshStandardMaterial color="#e11d48" emissive="#9f1239" emissiveIntensity={0.5} transparent opacity={0.85} />
      </mesh>

      <mesh>
        <tubeGeometry args={[vascularPaths.aortaToLeftLeg, 32, 0.014, 8, false]} />
        <meshStandardMaterial color="#e11d48" emissive="#9f1239" emissiveIntensity={0.5} transparent opacity={0.85} />
      </mesh>
      <mesh>
        <tubeGeometry args={[vascularPaths.aortaToRightLeg, 32, 0.014, 8, false]} />
        <meshStandardMaterial color="#e11d48" emissive="#9f1239" emissiveIntensity={0.5} transparent opacity={0.85} />
      </mesh>

      {/* Venous Return Conduits (Cyan / Blue) */}
      <mesh>
        <tubeGeometry args={[vascularPaths.inferiorVenaCava, 32, 0.020, 8, false]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive="#0369a1"
          emissiveIntensity={0.6}
          roughness={0.28}
          metalness={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>

      <mesh>
        <tubeGeometry args={[vascularPaths.superiorVenaCava, 24, 0.016, 8, false]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive="#0369a1"
          emissiveIntensity={0.6}
          roughness={0.28}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Flowing Erythrocytes Particles */}
      {particlesVisible && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleData.count}
              array={particleData.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={particleData.count}
              array={particleData.colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.018}
            vertexColors
            transparent
            opacity={0.92}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
};
