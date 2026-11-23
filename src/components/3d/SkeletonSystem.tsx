import React, { useMemo } from 'react';
import * as THREE from 'three';

interface SkeletonSystemProps {
  visible: boolean;
  opacity?: number;
}

export const SkeletonSystem: React.FC<SkeletonSystemProps> = ({
  visible,
  opacity = 0.35
}) => {
  // BioDigital Holographic Bone / Skeletal Shader
  const skeletonMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color('#38bdf8') }, // Medical Cyan
        uEdgeColor: { value: new THREE.Color('#818cf8') }, // Indigo edge
        uOpacity: { value: opacity }
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
        uniform vec3 uEdgeColor;
        uniform float uOpacity;
        
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;
        
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          
          float fresnel = 1.0 - abs(dot(viewDir, normal));
          fresnel = pow(fresnel, 2.0);
          
          float ribGlow = sin(vWorldPosition.y * 50.0) * 0.1 + 0.9;
          
          vec3 finalColor = mix(uColor, uEdgeColor, fresnel * 0.8);
          float alpha = (fresnel * 0.75 + 0.15) * uOpacity * ribGlow;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `
    });
  }, [opacity]);

  // Procedural Ribcage Curves
  const ribGeometries = useMemo(() => {
    const ribs: THREE.BufferGeometry[] = [];
    const ribCount = 10; // 10 visible articulated thoracic ribs

    for (let i = 0; i < ribCount; i++) {
      const progress = i / (ribCount - 1);
      const y = 1.42 - progress * 0.46; // thoracic levels T1 to T10
      const width = Math.sin(progress * Math.PI * 0.85 + 0.15) * 0.28 + 0.08;
      const depth = Math.sin(progress * Math.PI * 0.85 + 0.15) * 0.18 + 0.05;

      // Left rib curve: from posterior spine around to anterior sternum
      const leftCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.02, y, -0.07),                  // Posterior spine attachment
        new THREE.Vector3(-width * 0.75, y - 0.02, -0.05),   // Posterior-lateral curve
        new THREE.Vector3(-width, y - 0.05, depth * 0.2),     // Lateral mid-axillary line
        new THREE.Vector3(-width * 0.65, y - 0.07, depth),    // Anterior-lateral costal arch
        new THREE.Vector3(-0.025, y - 0.08, depth * 0.95)     // Costal cartilage to sternum
      ]);

      // Right rib curve
      const rightCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.02, y, -0.07),
        new THREE.Vector3(width * 0.75, y - 0.02, -0.05),
        new THREE.Vector3(width, y - 0.05, depth * 0.2),
        new THREE.Vector3(width * 0.65, y - 0.07, depth),
        new THREE.Vector3(0.025, y - 0.08, depth * 0.95)
      ]);

      ribs.push(new THREE.TubeGeometry(leftCurve, 20, 0.007, 8, false));
      ribs.push(new THREE.TubeGeometry(rightCurve, 20, 0.007, 8, false));
    }

    return ribs;
  }, []);

  // Spine vertebral column
  const spineGeometry = useMemo(() => {
    const spineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.82, -0.03),  // Cervical C1 (atlas)
      new THREE.Vector3(0, 1.68, -0.04),  // C7
      new THREE.Vector3(0, 1.48, -0.07),  // Thoracic kyphosis peak T5
      new THREE.Vector3(0, 1.20, -0.08),  // T10
      new THREE.Vector3(0, 0.92, -0.06),  // Lumbar lordosis L2
      new THREE.Vector3(0, 0.68, -0.05),  // L5
      new THREE.Vector3(0, 0.50, -0.08),  // Sacrum
      new THREE.Vector3(0, 0.40, -0.06)   // Coccyx
    ]);
    return new THREE.TubeGeometry(spineCurve, 36, 0.022, 12, false);
  }, []);

  // Clavicles (Collar bones)
  const clavicleGeometries = useMemo(() => {
    const leftClavicle = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.025, 1.50, 0.11),  // Sternoclavicular joint
      new THREE.Vector3(-0.16, 1.52, 0.08),   // Medial curve
      new THREE.Vector3(-0.34, 1.51, 0.02)    // Acromioclavicular joint
    ]);

    const rightClavicle = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.025, 1.50, 0.11),
      new THREE.Vector3(0.16, 1.52, 0.08),
      new THREE.Vector3(0.34, 1.51, 0.02)
    ]);

    return {
      left: new THREE.TubeGeometry(leftClavicle, 16, 0.009, 8, false),
      right: new THREE.TubeGeometry(rightClavicle, 16, 0.009, 8, false)
    };
  }, []);

  // Pelvic Girdle Arch (Iliac Crests)
  const pelvisGeometries = useMemo(() => {
    const leftIliac = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, 0.52, -0.07), // Sacroiliac joint
      new THREE.Vector3(-0.24, 0.58, -0.02), // Iliac crest high point
      new THREE.Vector3(-0.25, 0.42, 0.08),  // ASIS (Anterior superior iliac spine)
      new THREE.Vector3(-0.12, 0.32, 0.10),  // Pubic tubercle
      new THREE.Vector3(-0.01, 0.30, 0.09)   // Pubic symphysis
    ]);

    const rightIliac = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.04, 0.52, -0.07),
      new THREE.Vector3(0.24, 0.58, -0.02),
      new THREE.Vector3(0.25, 0.42, 0.08),
      new THREE.Vector3(0.12, 0.32, 0.10),
      new THREE.Vector3(0.01, 0.30, 0.09)
    ]);

    return {
      left: new THREE.TubeGeometry(leftIliac, 20, 0.012, 8, false),
      right: new THREE.TubeGeometry(rightIliac, 20, 0.012, 8, false)
    };
  }, []);

  if (!visible) return null;

  return (
    <group name="anatomical-skeletal-guide">
      {/* Vertebral Column (Spine) */}
      <mesh geometry={spineGeometry} material={skeletonMaterial} />

      {/* Individual Vertebral Discs accents */}
      {[1.72, 1.60, 1.46, 1.32, 1.18, 1.04, 0.90, 0.76, 0.62].map((y, idx) => (
        <mesh key={`disc-${idx}`} position={[0, y, -0.07]} rotation={[0.05, 0, 0]} material={skeletonMaterial}>
          <cylinderGeometry args={[0.028, 0.028, 0.018, 14]} />
        </mesh>
      ))}

      {/* Sternum (Chest Bone: Manubrium, Body, Xiphoid) */}
      <group position={[0, 1.26, 0.20]} rotation={[0.08, 0, 0]}>
        {/* Manubrium */}
        <mesh position={[0, 0.18, 0]} material={skeletonMaterial}>
          <boxGeometry args={[0.055, 0.07, 0.016]} />
        </mesh>
        {/* Sternal Body */}
        <mesh position={[0, 0.04, 0]} material={skeletonMaterial}>
          <boxGeometry args={[0.038, 0.18, 0.014]} />
        </mesh>
        {/* Xiphoid Process */}
        <mesh position={[0, -0.08, 0]} material={skeletonMaterial}>
          <coneGeometry args={[0.014, 0.04, 12]} />
        </mesh>
      </group>

      {/* Bilateral Ribs */}
      {ribGeometries.map((geo, idx) => (
        <mesh key={`rib-${idx}`} geometry={geo} material={skeletonMaterial} />
      ))}

      {/* Bilateral Clavicles (Collar bones) */}
      <mesh geometry={clavicleGeometries.left} material={skeletonMaterial} />
      <mesh geometry={clavicleGeometries.right} material={skeletonMaterial} />

      {/* Pelvic Girdle (Iliac Crests) */}
      <mesh geometry={pelvisGeometries.left} material={skeletonMaterial} />
      <mesh geometry={pelvisGeometries.right} material={skeletonMaterial} />

      {/* Sacrum & Pelvic Basin */}
      <mesh position={[0, 0.44, -0.05]} rotation={[-0.2, 0, 0]} material={skeletonMaterial}>
        <coneGeometry args={[0.08, 0.12, 16]} />
      </mesh>
    </group>
  );
};
