import React, { useMemo } from 'react';
import * as THREE from 'three';

interface HumanBodySilhouetteProps {
  wireframeOnly?: boolean;
  opacity?: number;
}

/**
 * Creates a smooth, continuous organic lofted mesh along a series of cross-sectional rings.
 * Supports watertight polar dome capping at top and bottom for seamless, solid anatomical geometry.
 * Computes vertex normals for a seamless, seam-free organic biological appearance.
 */
function createLoftedGeometry(
  slices: {
    y: number;
    rx: number;
    rz: number;
    cx?: number;
    cz?: number;
    frontBulge?: number;
    backFlatten?: number;
  }[],
  radialSegments = 32,
  capBottom = false,
  capTop = false
): THREE.BufferGeometry {
  const rings = slices.length;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < rings; i++) {
    const s = slices[i];
    const cx = s.cx ?? 0;
    const cz = s.cz ?? 0;
    const fb = s.frontBulge ?? 1.0;
    const bf = s.backFlatten ?? 1.0;

    for (let j = 0; j < radialSegments; j++) {
      const theta = (j / radialSegments) * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      // Organic radial modulation: front (sinT > 0) vs back (sinT < 0)
      const zScale = sinT >= 0 ? s.rz * fb : s.rz * bf;
      const x = cx + cosT * s.rx;
      const y = s.y;
      const z = cz + sinT * zScale;

      positions.push(x, y, z);
      uvs.push(j / radialSegments, i / Math.max(rings - 1, 1));
    }
  }

  // Generate quad-strip indices connecting adjacent rings
  for (let i = 0; i < rings - 1; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const nextJ = (j + 1) % radialSegments;
      const a = i * radialSegments + j;
      const b = (i + 1) * radialSegments + j;
      const c = (i + 1) * radialSegments + nextJ;
      const d = i * radialSegments + nextJ;

      indices.push(a, b, c);
      indices.push(a, c, d);
    }
  }

  // Cap bottom ring with outward-facing triangle fan
  if (capBottom && rings > 0) {
    const s0 = slices[0];
    const centerIndex = positions.length / 3;
    positions.push(s0.cx ?? 0, s0.y, s0.cz ?? 0);
    uvs.push(0.5, 0.5);

    for (let j = 0; j < radialSegments; j++) {
      const nextJ = (j + 1) % radialSegments;
      indices.push(centerIndex, nextJ, j);
    }
  }

  // Cap top ring with outward-facing triangle fan
  if (capTop && rings > 0) {
    const sTop = slices[rings - 1];
    const centerIndex = positions.length / 3;
    positions.push(sTop.cx ?? 0, sTop.y, sTop.cz ?? 0);
    uvs.push(0.5, 0.5);

    const topRingOffset = (rings - 1) * radialSegments;
    for (let j = 0; j < radialSegments; j++) {
      const nextJ = (j + 1) % radialSegments;
      indices.push(centerIndex, topRingOffset + j, topRingOffset + nextJ);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates a smooth organic limb (arms, thighs) lofted along a 3D curved spine path with optional end caps.
 */
function createLimbGeometry(
  spine: { x: number; y: number; z: number; rx: number; rz: number }[],
  radialSegments = 24,
  capBottom = true
): THREE.BufferGeometry {
  const slices = spine.map((pt) => ({
    y: pt.y,
    rx: pt.rx,
    rz: pt.rz,
    cx: pt.x,
    cz: pt.z,
  }));
  return createLoftedGeometry(slices, radialSegments, capBottom, false);
}

export const HumanBodySilhouette: React.FC<HumanBodySilhouetteProps> = ({
  wireframeOnly = false,
  opacity = 0.16,
}) => {
  const bodyOpacity = wireframeOnly ? 0.08 : opacity;

  // 1. Continuous Organic Torso (Pelvis, Iliac Crest, Waist, Hypochondrium, Pectorals, Clavicles, Neck)
  // Dimensions calibrated to comfortably encase all organs (Liver, Kidneys, Heart, Stomach)
  const torsoGeometry = useMemo(() => {
    const slices = [
      // Base of Pelvis / Perineum floor (capped)
      { y: -0.68, rx: 0.38, rz: 0.22, cz: -0.01 },
      { y: -0.52, rx: 0.48, rz: 0.25, cz: -0.02, frontBulge: 1.08 },
      // Widest Hips (Greater Trochanter flare)
      { y: -0.32, rx: 0.52, rz: 0.26, cz: -0.02, frontBulge: 1.08 },
      // Iliac Crest (Hip bone rim, frames lower kidneys)
      { y: -0.12, rx: 0.48, rz: 0.24, cz: -0.01 },
      // Lower Abdomen / Navel
      { y: 0.08, rx: 0.45, rz: 0.23, cz: -0.01, frontBulge: 1.06 },
      // Natural Narrowed Waist
      { y: 0.28, rx: 0.46, rz: 0.23, cz: -0.01 },
      // Lower Thorax / Hypochondrium (Comfortably encases liver right lobe & stomach)
      { y: 0.48, rx: 0.54, rz: 0.26, cz: 0.01, frontBulge: 1.12 },
      { y: 0.72, rx: 0.57, rz: 0.27, cz: 0.02, frontBulge: 1.14 },
      // Mid Thorax / Pectoral Region (Frames heart & mediastinum)
      { y: 0.95, rx: 0.58, rz: 0.28, cz: 0.03, frontBulge: 1.16, backFlatten: 0.94 },
      { y: 1.18, rx: 0.58, rz: 0.27, cz: 0.03, frontBulge: 1.15, backFlatten: 0.95 },
      // Upper Chest
      { y: 1.36, rx: 0.59, rz: 0.26, cz: 0.02, frontBulge: 1.10 },
      // Clavicular Region / Shoulder Slope
      { y: 1.48, rx: 0.64, rz: 0.23, cz: 0.01 },
      // Trapezius Slope
      { y: 1.58, rx: 0.48, rz: 0.20, cz: 0.01 },
      // Neck Base
      { y: 1.66, rx: 0.24, rz: 0.18, cz: 0.02 },
      // Mid Cervical Neck
      { y: 1.76, rx: 0.18, rz: 0.17, cz: 0.03 },
      // Under Chin / Throat Contour
      { y: 1.86, rx: 0.19, rz: 0.18, cz: 0.04 },
    ];
    return createLoftedGeometry(slices, 36, true, false);
  }, []);

  // 2. Anatomically Proportioned Head with Chin, Jawline & Cranium Dome (Fully Watertight Capped)
  const headGeometry = useMemo(() => {
    const slices = [
      // Chin Apex & Base
      { y: 1.82, rx: 0.06, rz: 0.08, cz: 0.12, frontBulge: 1.2 },
      // Lower Jawline (Angle of mandible)
      { y: 1.94, rx: 0.16, rz: 0.17, cz: 0.07, frontBulge: 1.25, backFlatten: 0.85 },
      // Upper Jaw & Lip Level
      { y: 2.04, rx: 0.24, rz: 0.24, cz: 0.04, frontBulge: 1.2 },
      // Cheeks & Nose Bridge / Mid-Face
      { y: 2.16, rx: 0.32, rz: 0.33, cz: 0.02, frontBulge: 1.15 },
      // Eye Sockets & Temples (Frames brain at y=2.22)
      { y: 2.26, rx: 0.36, rz: 0.38, cz: 0.01, frontBulge: 1.05 },
      // Brow Line & Forehead
      { y: 2.38, rx: 0.38, rz: 0.41, cz: -0.01 },
      // Parietal Cranial Vault
      { y: 2.50, rx: 0.34, rz: 0.38, cz: -0.02 },
      // Crown of Skull
      { y: 2.60, rx: 0.24, rz: 0.28, cz: -0.02 },
      // Cranial Apex Dome
      { y: 2.67, rx: 0.08, rz: 0.10, cz: -0.02 },
    ];
    return createLoftedGeometry(slices, 32, true, true);
  }, []);

  // 3. Natural Left Arm Draped Smoothly at Side with Forearm & Hand (Watertight Capped)
  const leftArmGeometry = useMemo(() => {
    const spine = [
      // Deltoid Shoulder Cap
      { x: -0.72, y: 1.50, z: 0.01, rx: 0.14, rz: 0.14 },
      { x: -0.78, y: 1.32, z: 0.00, rx: 0.12, rz: 0.13 },
      // Bicep / Mid Upper Arm
      { x: -0.81, y: 1.10, z: -0.01, rx: 0.11, rz: 0.11 },
      { x: -0.81, y: 0.88, z: -0.02, rx: 0.10, rz: 0.10 },
      // Elbow Joint
      { x: -0.80, y: 0.68, z: -0.03, rx: 0.09, rz: 0.09 },
      // Upper Forearm
      { x: -0.77, y: 0.46, z: -0.01, rx: 0.085, rz: 0.08 },
      // Mid Forearm
      { x: -0.73, y: 0.24, z: 0.01, rx: 0.075, rz: 0.07 },
      // Wrist
      { x: -0.70, y: 0.02, z: 0.03, rx: 0.06, rz: 0.05 },
      // Palm / Hand (Resting beside hip)
      { x: -0.67, y: -0.16, z: 0.04, rx: 0.055, rz: 0.035 },
      // Fingers (Tapering naturally)
      { x: -0.65, y: -0.32, z: 0.04, rx: 0.035, rz: 0.02 },
      { x: -0.64, y: -0.42, z: 0.04, rx: 0.015, rz: 0.01 },
    ];
    return createLimbGeometry(spine, 24, true);
  }, []);

  // 4. Natural Right Arm (Symmetric Watertight Capped)
  const rightArmGeometry = useMemo(() => {
    const spine = [
      { x: 0.72, y: 1.50, z: 0.01, rx: 0.14, rz: 0.14 },
      { x: 0.78, y: 1.32, z: 0.00, rx: 0.12, rz: 0.13 },
      { x: 0.81, y: 1.10, z: -0.01, rx: 0.11, rz: 0.11 },
      { x: 0.81, y: 0.88, z: -0.02, rx: 0.10, rz: 0.10 },
      { x: 0.80, y: 0.68, z: -0.03, rx: 0.09, rz: 0.09 },
      { x: 0.77, y: 0.46, z: -0.01, rx: 0.085, rz: 0.08 },
      { x: 0.73, y: 0.24, z: 0.01, rx: 0.075, rz: 0.07 },
      { x: 0.70, y: 0.02, z: 0.03, rx: 0.06, rz: 0.05 },
      { x: 0.67, y: -0.16, z: 0.04, rx: 0.055, rz: 0.035 },
      { x: 0.65, y: -0.32, z: 0.04, rx: 0.035, rz: 0.02 },
      { x: 0.64, y: -0.42, z: 0.04, rx: 0.015, rz: 0.01 },
    ];
    return createLimbGeometry(spine, 24, true);
  }, []);

  // 5. Natural Left Thigh / Upper Leg (Watertight Capped)
  const leftLegGeometry = useMemo(() => {
    const spine = [
      // Hip Socket
      { x: -0.27, y: -0.65, z: -0.01, rx: 0.22, rz: 0.22 },
      // Upper Thigh / Quadriceps Flare
      { x: -0.27, y: -0.88, z: 0.01, rx: 0.20, rz: 0.21 },
      // Mid Thigh
      { x: -0.26, y: -1.18, z: 0.01, rx: 0.18, rz: 0.19 },
      { x: -0.25, y: -1.48, z: 0.00, rx: 0.16, rz: 0.17 },
      // Above Knee
      { x: -0.25, y: -1.78, z: 0.01, rx: 0.14, rz: 0.14 },
      // Knee Contour
      { x: -0.25, y: -1.98, z: 0.02, rx: 0.13, rz: 0.13 },
      // Upper Shin / Calf Start
      { x: -0.24, y: -2.25, z: 0.00, rx: 0.11, rz: 0.11 },
      // Lower Taper
      { x: -0.24, y: -2.39, z: 0.00, rx: 0.06, rz: 0.06 },
    ];
    return createLimbGeometry(spine, 24, true);
  }, []);

  // 6. Natural Right Thigh / Upper Leg (Symmetric Watertight Capped)
  const rightLegGeometry = useMemo(() => {
    const spine = [
      { x: 0.27, y: -0.65, z: -0.01, rx: 0.22, rz: 0.22 },
      { x: 0.27, y: -0.88, z: 0.01, rx: 0.20, rz: 0.21 },
      { x: 0.26, y: -1.18, z: 0.01, rx: 0.18, rz: 0.19 },
      { x: 0.25, y: -1.48, z: 0.00, rx: 0.16, rz: 0.17 },
      { x: 0.25, y: -1.78, z: 0.01, rx: 0.14, rz: 0.14 },
      { x: 0.25, y: -1.98, z: 0.02, rx: 0.13, rz: 0.13 },
      { x: 0.24, y: -2.25, z: 0.00, rx: 0.11, rz: 0.11 },
      { x: 0.24, y: -2.39, z: 0.00, rx: 0.06, rz: 0.06 },
    ];
    return createLimbGeometry(spine, 24, true);
  }, []);

  // 7. Subtle Anatomical Ribcage Landmarks (10 Pairs of Curved Rib Arches + Sternum)
  const ribGeometries = useMemo(() => {
    const ribs: { left: THREE.TubeGeometry; right: THREE.TubeGeometry }[] = [];

    for (let i = 0; i < 10; i++) {
      // From upper thoracic (T1/T2) down to lower rib margin (T10 framing liver & stomach)
      const yBack = 1.38 - i * 0.10;
      const yFront = 1.28 - i * 0.098;
      const flare = 0.36 + Math.sin(((i + 1) / 11) * Math.PI) * 0.22;
      const zFlare = 0.20 + Math.sin(((i + 1) / 11) * Math.PI) * 0.08;

      // Left rib curve from posterior spine to anterior costal cartilage
      const leftCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.04, yBack, -0.16),
        new THREE.Vector3(-flare * 0.72, yBack - 0.02, -0.12),
        new THREE.Vector3(-flare, (yBack + yFront) * 0.5, 0.02),
        new THREE.Vector3(-flare * 0.78, yFront + 0.01, zFlare * 0.82),
        new THREE.Vector3(-0.07 - i * 0.012, yFront, zFlare),
      ]);

      // Right rib curve
      const rightCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.04, yBack, -0.16),
        new THREE.Vector3(flare * 0.72, yBack - 0.02, -0.12),
        new THREE.Vector3(flare, (yBack + yFront) * 0.5, 0.02),
        new THREE.Vector3(flare * 0.78, yFront + 0.01, zFlare * 0.82),
        new THREE.Vector3(0.07 + i * 0.012, yFront, zFlare),
      ]);

      ribs.push({
        left: new THREE.TubeGeometry(leftCurve, 20, 0.011, 6, false),
        right: new THREE.TubeGeometry(rightCurve, 20, 0.011, 6, false),
      });
    }

    return ribs;
  }, []);

  // 8. Subtle Anatomical Sternum (Breastbone Anchor Framing the Chest Cavity)
  const sternumGeometry = useMemo(() => {
    const sternumCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.44, 0.18), // Manubrium top
      new THREE.Vector3(0, 1.32, 0.22), // Sternal angle
      new THREE.Vector3(0, 1.10, 0.25), // Mid-body
      new THREE.Vector3(0, 0.88, 0.26), // Lower body
      new THREE.Vector3(0, 0.70, 0.25), // Xiphoid process
    ]);
    return new THREE.TubeGeometry(sternumCurve, 20, 0.016, 8, false);
  }, []);

  // 9. Subtle Anatomical Clavicles (Collarbones)
  const clavicleGeometries = useMemo(() => {
    const leftClavicleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, 1.48, 0.16),
      new THREE.Vector3(-0.25, 1.50, 0.13),
      new THREE.Vector3(-0.50, 1.49, 0.07),
      new THREE.Vector3(-0.68, 1.48, 0.01),
    ]);
    const rightClavicleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.04, 1.48, 0.16),
      new THREE.Vector3(0.25, 1.50, 0.13),
      new THREE.Vector3(0.50, 1.49, 0.07),
      new THREE.Vector3(0.68, 1.48, 0.01),
    ]);
    return {
      left: new THREE.TubeGeometry(leftClavicleCurve, 16, 0.013, 6, false),
      right: new THREE.TubeGeometry(rightClavicleCurve, 16, 0.013, 6, false),
    };
  }, []);

  // 10. Spine Landmarks (S-Curved Vertebral Column Behind Organs)
  const spineDiscs = useMemo(() => {
    const discs: { position: [number, number, number]; scale: [number, number, number] }[] = [];
    const count = 18;

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const y = 1.70 - t * 2.25; // From cervical neck down to sacrum

      // Human spine natural curvature (cervical lordosis, thoracic kyphosis, lumbar lordosis)
      let z = -0.14;
      if (y > 1.4) {
        z = -0.06 - (1.7 - y) * 0.15;
      } else if (y > 0.4) {
        z = -0.16 - Math.sin(((y - 0.4) / 1.0) * Math.PI) * 0.04;
      } else if (y > -0.2) {
        z = -0.14 + Math.sin(((y + 0.2) / 0.6) * Math.PI) * 0.03;
      } else {
        z = -0.12 - (y + 0.2) * 0.05;
      }

      discs.push({
        position: [0, y, z],
        scale: [0.065, 0.035, 0.055],
      });
    }

    return discs;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* 
        ========================================================================
        1. TRANSLUCENT MEDICAL GLASS HUMAN BODY SILHOUETTE
        Precision physical glass material with Fresnel rim highlights:
        - transmission: 0.92, roughness: 0.15
        - depthWrite: false ensures internal glowing organs are crystal-clear
        - side={THREE.FrontSide} ensures smooth glass exterior with zero interior back-face artifacts
        ========================================================================
      */}
      <group>
        {/* Main Organic Torso, Waist & Neck */}
        <mesh geometry={torsoGeometry}>
          <meshPhysicalMaterial
            color="#0f172a"
            emissive="#38bdf8"
            emissiveIntensity={0.06}
            roughness={0.15}
            metalness={0.08}
            transmission={0.92}
            ior={1.33}
            transparent
            opacity={bodyOpacity}
            wireframe={wireframeOnly}
            depthWrite={false}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Anatomically Sculpted Head & Chin */}
        <mesh geometry={headGeometry}>
          <meshPhysicalMaterial
            color="#0f172a"
            emissive="#38bdf8"
            emissiveIntensity={0.07}
            roughness={0.15}
            metalness={0.08}
            transmission={0.92}
            ior={1.33}
            transparent
            opacity={bodyOpacity * 1.05}
            wireframe={wireframeOnly}
            depthWrite={false}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Natural Left & Right Draped Arms */}
        <mesh geometry={leftArmGeometry}>
          <meshPhysicalMaterial
            color="#0f172a"
            emissive="#38bdf8"
            emissiveIntensity={0.05}
            roughness={0.16}
            metalness={0.08}
            transmission={0.92}
            transparent
            opacity={bodyOpacity * 0.75}
            wireframe={wireframeOnly}
            depthWrite={false}
            side={THREE.FrontSide}
          />
        </mesh>
        <mesh geometry={rightArmGeometry}>
          <meshPhysicalMaterial
            color="#0f172a"
            emissive="#38bdf8"
            emissiveIntensity={0.05}
            roughness={0.16}
            metalness={0.08}
            transmission={0.92}
            transparent
            opacity={bodyOpacity * 0.75}
            wireframe={wireframeOnly}
            depthWrite={false}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Natural Left & Right Tapering Thighs */}
        <mesh geometry={leftLegGeometry}>
          <meshPhysicalMaterial
            color="#0f172a"
            emissive="#38bdf8"
            emissiveIntensity={0.04}
            roughness={0.18}
            metalness={0.08}
            transmission={0.92}
            transparent
            opacity={bodyOpacity * 0.7}
            wireframe={wireframeOnly}
            depthWrite={false}
            side={THREE.FrontSide}
          />
        </mesh>
        <mesh geometry={rightLegGeometry}>
          <meshPhysicalMaterial
            color="#0f172a"
            emissive="#38bdf8"
            emissiveIntensity={0.04}
            roughness={0.18}
            metalness={0.08}
            transmission={0.92}
            transparent
            opacity={bodyOpacity * 0.7}
            wireframe={wireframeOnly}
            depthWrite={false}
            side={THREE.FrontSide}
          />
        </mesh>
      </group>

      {/*
        ========================================================================
        2. SUBTLE ANATOMICAL LANDMARKS (Ribcage, Sternum, Clavicles, Spine)
        Gently frames internal organs without obstructing viewing angles.
        ========================================================================
      */}
      {!wireframeOnly && (
        <group>
          {/* Ribcage Arches */}
          {ribGeometries.map((rib, i) => (
            <group key={i}>
              <mesh geometry={rib.left}>
                <meshBasicMaterial
                  color="#38bdf8"
                  transparent
                  opacity={0.16}
                  depthWrite={false}
                />
              </mesh>
              <mesh geometry={rib.right}>
                <meshBasicMaterial
                  color="#38bdf8"
                  transparent
                  opacity={0.16}
                  depthWrite={false}
                />
              </mesh>
            </group>
          ))}

          {/* Central Sternum (Breastbone) */}
          <mesh geometry={sternumGeometry}>
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.20}
              depthWrite={false}
            />
          </mesh>

          {/* Clavicles (Collarbones) */}
          <mesh geometry={clavicleGeometries.left}>
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.22}
              depthWrite={false}
            />
          </mesh>
          <mesh geometry={clavicleGeometries.right}>
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.22}
              depthWrite={false}
            />
          </mesh>

          {/* S-Curved Vertebral Spine Discs */}
          {spineDiscs.map((disc, idx) => (
            <mesh key={idx} position={disc.position} scale={disc.scale}>
              <cylinderGeometry args={[1, 1, 1, 16]} />
              <meshBasicMaterial
                color="#38bdf8"
                transparent
                opacity={0.15}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* 3. Subtle Clinical Base Pedestal Ring */}
      <mesh position={[0, -2.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 2.2, 48]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.07}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
