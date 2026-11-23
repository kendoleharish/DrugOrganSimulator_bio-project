import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface VascularNetworkProps {
  plasmaConcentration?: number; // mg/L
  showVessels?: boolean;
}

interface VesselPath {
  id: string;
  type: 'artery' | 'vein' | 'portal';
  curve: THREE.CatmullRomCurve3;
  radius: number;
  geometry: THREE.TubeGeometry;
}

const PARTICLE_COUNT = 90;
const INSTANCED_ARGS: [undefined, undefined, number] = [undefined, undefined, PARTICLE_COUNT];

export const VascularNetwork: React.FC<VascularNetworkProps> = ({
  plasmaConcentration = 0,
  showVessels = true,
}) => {
  // Define anatomical vascular curves
  const paths = useMemo<VesselPath[]>(() => {
    const rawConfigs: Omit<VesselPath, 'geometry'>[] = [
      // 1. Thoracic & Abdominal Aorta
      {
        id: 'aorta-main',
        type: 'artery',
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.12, 1.15, 0.12),
          new THREE.Vector3(-0.06, 1.35, 0.08),
          new THREE.Vector3(0.0, 1.25, 0.02),
          new THREE.Vector3(0.0, 0.65, -0.04),
          new THREE.Vector3(0.0, 0.0, -0.05),
          new THREE.Vector3(0.0, -0.65, -0.05),
        ]),
        radius: 0.028,
      },
      // 2. Inferior Vena Cava
      {
        id: 'vena-cava-inferior',
        type: 'vein',
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.06, -0.65, -0.04),
          new THREE.Vector3(0.06, 0.0, -0.04),
          new THREE.Vector3(0.05, 0.6, -0.03),
          new THREE.Vector3(-0.04, 1.1, 0.08),
        ]),
        radius: 0.025,
      },
      // 3. Left Carotid Artery (Heart -> Left Brain)
      {
        id: 'left-carotid',
        type: 'artery',
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.06, 1.35, 0.08),
          new THREE.Vector3(-0.08, 1.7, 0.04),
          new THREE.Vector3(-0.1, 1.95, 0.02),
          new THREE.Vector3(-0.08, 2.15, 0.0),
        ]),
        radius: 0.016,
      },
      // 4. Right Carotid Artery (Heart -> Right Brain)
      {
        id: 'right-carotid',
        type: 'artery',
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.0, 1.32, 0.07),
          new THREE.Vector3(0.08, 1.7, 0.04),
          new THREE.Vector3(0.1, 1.95, 0.02),
          new THREE.Vector3(0.08, 2.15, 0.0),
        ]),
        radius: 0.016,
      },
      // 5. Left Jugular Vein (Brain -> SVC -> Heart)
      {
        id: 'left-jugular',
        type: 'vein',
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.14, 2.1, 0.0),
          new THREE.Vector3(-0.13, 1.7, 0.03),
          new THREE.Vector3(-0.05, 1.3, 0.06),
          new THREE.Vector3(-0.04, 1.15, 0.08),
        ]),
        radius: 0.015,
      },
      // 6. Right Jugular Vein (Brain -> SVC -> Heart)
      {
        id: 'right-jugular',
        type: 'vein',
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.14, 2.1, 0.0),
          new THREE.Vector3(0.13, 1.7, 0.03),
          new THREE.Vector3(0.02, 1.3, 0.06),
          new THREE.Vector3(-0.02, 1.15, 0.08),
        ]),
        radius: 0.015,
      },
      // 7. Celiac Artery (Aorta -> Stomach)
      {
        id: 'celiac-stomach',
        type: 'artery',
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.0, 0.52, -0.04),
          new THREE.Vector3(-0.14, 0.48, 0.02),
          new THREE.Vector3(-0.28, 0.44, 0.1),
        ]),
        radius: 0.015,
      },
      // 8. Hepatic Portal System (Stomach / Gut -> Liver)
      {
        id: 'portal-vein',
        type: 'portal',
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.24, 0.38, 0.08),
          new THREE.Vector3(0.0, 0.34, 0.06),
          new THREE.Vector3(0.24, 0.4, 0.1),
        ]),
        radius: 0.018,
      },
      // 9. Hepatic Artery (Aorta -> Liver)
      {
        id: 'hepatic-artery',
        type: 'artery',
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.0, 0.5, -0.04),
          new THREE.Vector3(0.15, 0.48, 0.02),
          new THREE.Vector3(0.3, 0.45, 0.1),
        ]),
        radius: 0.017,
      },
      // 10. Hepatic Vein (Liver -> IVC)
      {
        id: 'hepatic-vein',
        type: 'vein',
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.28, 0.48, 0.08),
          new THREE.Vector3(0.15, 0.55, 0.0),
          new THREE.Vector3(0.05, 0.6, -0.03),
        ]),
        radius: 0.018,
      },
      // 11. Left Renal Artery (Aorta -> Left Kidney)
      {
        id: 'left-renal-artery',
        type: 'artery',
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.0, 0.04, -0.05),
          new THREE.Vector3(-0.16, 0.0, -0.07),
          new THREE.Vector3(-0.32, -0.04, -0.1),
        ]),
        radius: 0.016,
      },
      // 12. Left Renal Vein (Left Kidney -> IVC)
      {
        id: 'left-renal-vein',
        type: 'vein',
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.32, -0.06, -0.1),
          new THREE.Vector3(-0.14, -0.02, -0.06),
          new THREE.Vector3(0.05, -0.01, -0.04),
        ]),
        radius: 0.017,
      },
      // 13. Right Renal Artery (Aorta -> Right Kidney)
      {
        id: 'right-renal-artery',
        type: 'artery',
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.0, -0.04, -0.05),
          new THREE.Vector3(0.16, -0.08, -0.07),
          new THREE.Vector3(0.32, -0.12, -0.1),
        ]),
        radius: 0.016,
      },
      // 14. Right Renal Vein (Right Kidney -> IVC)
      {
        id: 'right-renal-vein',
        type: 'vein',
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.32, -0.14, -0.1),
          new THREE.Vector3(0.16, -0.1, -0.06),
          new THREE.Vector3(0.06, -0.08, -0.04),
        ]),
        radius: 0.017,
      },
      // 15. Left Iliac / Femoral branch (descending)
      {
        id: 'left-femoral',
        type: 'artery',
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.0, -0.65, -0.05),
          new THREE.Vector3(-0.2, -0.95, -0.02),
          new THREE.Vector3(-0.32, -1.5, 0.0),
        ]),
        radius: 0.018,
      },
      // 16. Right Iliac / Femoral branch (descending)
      {
        id: 'right-femoral',
        type: 'artery',
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.0, -0.65, -0.05),
          new THREE.Vector3(0.2, -0.95, -0.02),
          new THREE.Vector3(0.32, -1.5, 0.0),
        ]),
        radius: 0.018,
      },
    ];

    return rawConfigs.map((item) => ({
      ...item,
      geometry: new THREE.TubeGeometry(item.curve, 32, item.radius, 8, false),
    }));
  }, []);

  // Cleanup pre-computed geometries when unmounting
  useEffect(() => {
    return () => {
      paths.forEach((p) => p.geometry.dispose());
    };
  }, [paths]);

  // Glowing Flow Particles along curves
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      pathIndex: i % paths.length,
      progress: Math.random(),
      speed: 0.12 + Math.random() * 0.18,
      size: 0.025 + Math.random() * 0.02,
    }));
  }, [paths]);

  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize particle stream colors (Arterial ruby, Venous sapphire, Portal violet)
  useEffect(() => {
    if (!instancedRef.current) return;
    const colorArtery = new THREE.Color('#fb7185');
    const colorVein = new THREE.Color('#38bdf8');
    const colorPortal = new THREE.Color('#c084fc');

    particles.forEach((p, idx) => {
      const type = paths[p.pathIndex]?.type;
      const c = type === 'artery' ? colorArtery : type === 'portal' ? colorPortal : colorVein;
      instancedRef.current!.setColorAt(idx, c);
    });
    if (instancedRef.current.instanceColor) {
      instancedRef.current.instanceColor.needsUpdate = true;
    }
  }, [paths, particles]);

  useFrame((state, delta) => {
    if (!instancedRef.current) return;

    // Circulation speed speeds up slightly with high plasma concentration or activity
    const circulationSpeedBoost = Math.min(1 + plasmaConcentration * 0.02, 1.8);

    particles.forEach((p, idx) => {
      p.progress += delta * p.speed * circulationSpeedBoost;
      if (p.progress > 1.0) {
        p.progress -= 1.0;
      }

      const vessel = paths[p.pathIndex];
      const pt = vessel.curve.getPointAt(p.progress);

      dummy.position.copy(pt);
      // Soft organic breathing scale along curve
      const s = p.size * (0.8 + Math.sin(p.progress * Math.PI) * 0.4);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();

      instancedRef.current!.setMatrixAt(idx, dummy.matrix);
    });

    instancedRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!showVessels) return null;

  return (
    <group>
      {/* 3D Static Vascular Pathway Tubes */}
      {paths.map((p) => {
        let vesselColor = '#dc2626'; // artery (refined crimson)
        let emissiveColor = '#991b1b';

        if (p.type === 'vein') {
          vesselColor = '#2563eb'; // vein (clinical sapphire)
          emissiveColor = '#1e40af';
        } else if (p.type === 'portal') {
          vesselColor = '#7c3aed'; // portal system (deep violet)
          emissiveColor = '#5b21b6';
        }

        // When plasma drug concentration is elevated, add subtle crystalline luminescence
        const drugInfluence = Math.min(plasmaConcentration / 30, 0.6);

        return (
          <mesh key={p.id} geometry={p.geometry}>
            <meshPhysicalMaterial
              color={vesselColor}
              emissive={emissiveColor}
              emissiveIntensity={0.25 + drugInfluence * 0.3}
              roughness={0.25}
              transmission={0.4}
              transparent
              opacity={0.65}
              depthWrite={false}
            />
          </mesh>
        );
      })}

      {/* Dynamic Animated Glowing Biological Pulse Particles */}
      <instancedMesh
        ref={instancedRef}
        args={INSTANCED_ARGS}
      >
        <sphereGeometry args={[1, 14, 14]} />
        <meshBasicMaterial
          transparent
          opacity={0.88}
        />
      </instancedMesh>
    </group>
  );
};
