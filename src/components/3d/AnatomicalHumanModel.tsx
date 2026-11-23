import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { 
  ANATOMY_BY_KEY, 
  ANATOMY_STRUCTURES, 
  AnatomySex 
} from 'open-anatomy-3d';
import { SimulationTimeStep } from '../../engine/types';
import { 
  PhysiologicalSystem, 
  AnatomySystem, 
  getStructurePhysiologicalSystem 
} from '../../types/ui';

export interface AnatomicalStructurePart {
  key: string;
  system: PhysiologicalSystem;
  label: string;
  category: string;
  color: string;
  meshes: THREE.Mesh[];
  materials: THREE.MeshStandardMaterial[];
  center: THREE.Vector3;
  bounds: THREE.Box3;
  radius: number;
}

export interface AnatomicalHumanModelProps {
  sex?: AnatomySex;
  dissectionDepth?: number; // 0 to 100
  systemVisibility?: Record<AnatomySystem, boolean>;
  systemOpacity?: Record<AnatomySystem, number>;
  selectedKey: string | null;
  hoveredKey: string | null;
  isolatedKey: string | null;
  currentStep?: SimulationTimeStep;
  stressHeatmapVisible?: boolean;
  onHover: (key: string | null, event?: { x: number; y: number }) => void;
  onSelect: (key: string | null) => void;
  onStructuresDiscovered?: (structures: Map<string, AnatomicalStructurePart>) => void;
}

// Pre-allocated colors to avoid memory churn and garbage collection pauses in useFrame
const HOVER_HIGHLIGHT_COLOR = new THREE.Color('#38bdf8'); // Medical Cyan
const SELECT_HIGHLIGHT_COLOR = new THREE.Color('#06b6d4'); // Electric Cyan
const TOXIC_COLOR = new THREE.Color('#dc2626');           // Toxic Necrosis Crimson
const STRESS_COLOR = new THREE.Color('#d97706');          // Cellular Stress Amber
const ZERO_COLOR = new THREE.Color('#000000');

export const SYSTEM_DEFAULT_OPACITIES: Record<PhysiologicalSystem, number> = {
  skin: 0.18,
  muscles: 0.85,
  skeleton: 0.75,
  nervous: 0.95,
  cardiovascular: 0.95,
  respiratory: 0.95,
  digestive: 1.0,
  urinary: 0.95,
  endocrine: 0.95,
  reproductive: 0.9
};

const SYSTEM_BASE_ROUGHNESS: Record<PhysiologicalSystem, number> = {
  skin: 0.5,
  muscles: 0.62,
  skeleton: 0.68,
  nervous: 0.48,
  cardiovascular: 0.35,
  respiratory: 0.55,
  digestive: 0.42,
  urinary: 0.45,
  endocrine: 0.5,
  reproductive: 0.48
};

function createTranslucentSkinShader(baseOpacity = 0.18) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    blending: THREE.NormalBlending,
    uniforms: {
      uColor: { value: new THREE.Color('#ecd2be') },       // Natural anatomical skin tone
      uRimColor: { value: new THREE.Color('#c28267') },    // Subsurface rim contour
      uOpacity: { value: baseOpacity },
      uTime: { value: 0 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vWorldPosition;
      
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uRimColor;
      uniform float uOpacity;
      uniform float uTime;
      
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vWorldPosition;
      
      void main() {
        vec3 norm = normalize(vNormal);
        vec3 view = normalize(vView);
        
        // Gentle Fresnel edge contour
        float fresnel = 1.0 - abs(dot(norm, view));
        float rim = pow(fresnel, 2.4);
        
        // Subtle soft directional lighting for anatomical volume
        vec3 lightDir = normalize(vec3(0.4, 0.8, 0.6));
        float diff = max(dot(norm, lightDir), 0.0) * 0.35 + 0.65;
        
        vec3 col = mix(uColor, uRimColor, rim * 0.75) * diff;
        float alpha = (0.04 + rim * 0.55) * uOpacity;
        
        gl_FragColor = vec4(col, alpha);
      }
    `
  });
}

export const AnatomicalHumanModel: React.FC<AnatomicalHumanModelProps> = ({
  sex = 'male',
  dissectionDepth = 0,
  systemVisibility = {
    skin: true,
    muscles: true,
    skeleton: true,
    nervous: true,
    cardiovascular: true,
    respiratory: true,
    digestive: true,
    urinary: true,
    endocrine: true,
    reproductive: true
  },
  systemOpacity = SYSTEM_DEFAULT_OPACITIES,
  selectedKey,
  hoveredKey,
  isolatedKey,
  currentStep,
  stressHeatmapVisible = true,
  onHover,
  onSelect,
  onStructuresDiscovered
}) => {
  const modelUrl = `/models/anatomy-${sex}.glb`;

  // Load GLB using Drei useGLTF with local MeshoptDecoder
  const { scene } = useGLTF(modelUrl, false, true, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });

  const skinMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  // Parse GLTF Scene into indexed physiological structures
  const { root, partsMap } = useMemo(() => {
    const rootClone = scene.clone(true);
    const parts = new Map<string, AnatomicalStructurePart>();

    // Create custom skin shader
    const skinShader = createTranslucentSkinShader(systemOpacity.skin ?? 0.18);
    skinMaterialRef.current = skinShader;

    // Traverse all nodes
    rootClone.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;

      // Find owner structure in catalog
      let owner: THREE.Object3D | null = obj;
      while (owner && !ANATOMY_BY_KEY[owner.name]) {
        owner = owner.parent;
      }

      if (!owner) return;
      const info = ANATOMY_BY_KEY[owner.name];
      if (!info) return;

      const physiologicalSystem = getStructurePhysiologicalSystem(info);

      obj.userData.anatomyKey = info.key;
      obj.userData.system = physiologicalSystem;
      obj.userData.catalogSystem = info.system;
      obj.castShadow = true;
      obj.receiveShadow = true;

      // Handle Skin System
      if (info.key === 'skin' || info.system === 'skin') {
        obj.material = skinShader;
        obj.renderOrder = 10;
        obj.userData.isSkin = true;
      } else {
        // High quality anatomical PBR standard material
        const baseColor = new THREE.Color(info.color || '#d1d5db');
        const roughness = SYSTEM_BASE_ROUGHNESS[physiologicalSystem] ?? 0.5;
        const initialOpacity = systemOpacity[physiologicalSystem] ?? SYSTEM_DEFAULT_OPACITIES[physiologicalSystem] ?? 1.0;

        const mat = new THREE.MeshStandardMaterial({
          color: baseColor,
          roughness,
          metalness: 0.04,
          transparent: initialOpacity < 1.0,
          opacity: initialOpacity,
          depthWrite: initialOpacity >= 0.85
        });

        // Store natural original color for simulation blending
        mat.userData.baseColor = baseColor.clone();
        mat.userData.originalOpacity = initialOpacity;

        obj.material = mat;
      }

      // Add to structures map
      let part = parts.get(info.key);
      if (!part) {
        part = {
          key: info.key,
          system: physiologicalSystem,
          label: info.label,
          category: info.category,
          color: info.color,
          meshes: [],
          materials: [],
          center: new THREE.Vector3(),
          bounds: new THREE.Box3(),
          radius: 0.1
        };
        parts.set(info.key, part);
      }

      part.meshes.push(obj);
      if (obj.material instanceof THREE.MeshStandardMaterial) {
        part.materials.push(obj.material);
      }
    });

    // Compute precise bounding boxes and centers
    rootClone.updateMatrixWorld(true);
    for (const part of parts.values()) {
      part.bounds.makeEmpty();
      for (const m of part.meshes) {
        part.bounds.expandByObject(m);
      }
      part.bounds.getCenter(part.center);
      const sphere = new THREE.Sphere();
      part.bounds.getBoundingSphere(sphere);
      part.radius = Math.max(0.04, sphere.radius);
    }

    return { root: rootClone, partsMap: parts };
  }, [scene, sex]);

  // Notify parent of discovered structures for camera framing and tree navigation
  useEffect(() => {
    if (onStructuresDiscovered && partsMap.size > 0) {
      onStructuresDiscovered(partsMap);
    }
  }, [partsMap, onStructuresDiscovered]);

  // Dynamic Dissection & System Opacities update
  useEffect(() => {
    const d = dissectionDepth / 100;

    // Progressive Medical Dissection Hierarchy:
    // 0% -> 15%: External Skin fades from 0.18 to 0
    // 15% -> 40%: Muscular system fades from 0.85 to 0
    // 40% -> 60%: Skeletal framework fades to subtle anatomical landmark guide (0.75 -> 0.12)
    // 60% -> 75%: Visceral digestive & urinary organs visible, revealing deep vascular and pulmonary architecture
    // 75% -> 90%: Cardiopulmonary lungs & heart core isolated
    // 90% -> 100%: Deep neuro-axial and central vascular conduits
    const skinDepthOpacity = (systemOpacity.skin ?? 0.18) * Math.max(0, 1 - d * 5);
    const muscleDepthOpacity = (systemOpacity.muscles ?? 0.85) * (d < 0.15 ? 1 : Math.max(0, 1 - (d - 0.15) * 3.5));
    const skeletonDepthOpacity = (systemOpacity.skeleton ?? 0.75) * (d < 0.35 ? 1 : Math.max(0.12, 1 - (d - 0.35) * 2.8));
    const digestiveDepthOpacity = (systemOpacity.digestive ?? 1.0) * (d < 0.60 ? 1 : Math.max(0.2, 1 - (d - 0.60) * 3.5));
    const urinaryDepthOpacity = (systemOpacity.urinary ?? 0.95) * (d < 0.60 ? 1 : Math.max(0.2, 1 - (d - 0.60) * 3.5));
    const endocrineDepthOpacity = (systemOpacity.endocrine ?? 0.95) * (d < 0.60 ? 1 : Math.max(0.2, 1 - (d - 0.60) * 3.5));
    const respiratoryDepthOpacity = (systemOpacity.respiratory ?? 0.95) * (d < 0.75 ? 1 : Math.max(0.25, 1 - (d - 0.75) * 4));
    const cardioDepthOpacity = (systemOpacity.cardiovascular ?? 0.95) * (d < 0.80 ? 1 : Math.max(0.3, 1 - (d - 0.80) * 4));
    const nervousDepthOpacity = systemOpacity.nervous ?? 0.95;

    if (skinMaterialRef.current) {
      const isSkinVisible = systemVisibility.skin !== false && skinDepthOpacity > 0.005;
      skinMaterialRef.current.uniforms.uOpacity.value = isSkinVisible ? skinDepthOpacity : 0.0;
      skinMaterialRef.current.visible = isSkinVisible;
    }

    // Apply opacities and visibility to all parts
    for (const part of partsMap.values()) {
      const isSystemOn = systemVisibility[part.system] !== false;
      const isIsolated = isolatedKey !== null;
      const isCurrentIsolatedPart = part.key === isolatedKey;

      let effectiveOpacity = systemOpacity[part.system] ?? SYSTEM_DEFAULT_OPACITIES[part.system] ?? 1.0;

      // Dissection depth modulation per physiological system
      if (part.system === 'muscles') effectiveOpacity = muscleDepthOpacity;
      else if (part.system === 'skeleton') effectiveOpacity = skeletonDepthOpacity;
      else if (part.system === 'digestive') effectiveOpacity = digestiveDepthOpacity;
      else if (part.system === 'urinary') effectiveOpacity = urinaryDepthOpacity;
      else if (part.system === 'endocrine' || part.system === 'reproductive') effectiveOpacity = endocrineDepthOpacity;
      else if (part.system === 'respiratory') effectiveOpacity = respiratoryDepthOpacity;
      else if (part.system === 'cardiovascular') effectiveOpacity = cardioDepthOpacity;
      else if (part.system === 'nervous') effectiveOpacity = nervousDepthOpacity;

      // Isolation mode override
      if (isIsolated) {
        if (!isCurrentIsolatedPart) {
          effectiveOpacity = 0.04; // Ghost non-isolated structures
        } else {
          effectiveOpacity = 1.0;  // Fully visible isolated structure
        }
      }

      const shouldBeVisible = isSystemOn && (isIsolated ? true : effectiveOpacity > 0.01);

      for (const mesh of part.meshes) {
        mesh.visible = shouldBeVisible;
      }

      for (const mat of part.materials) {
        mat.opacity = effectiveOpacity;
        mat.transparent = effectiveOpacity < 0.99;
        mat.depthWrite = effectiveOpacity >= 0.85;
      }
    }
  }, [dissectionDepth, systemVisibility, systemOpacity, isolatedKey, partsMap]);

  // Update static material colors and highlight emissions when selection or hover state changes
  useEffect(() => {
    for (const part of partsMap.values()) {
      const isHovered = part.key === hoveredKey;
      const isSelected = part.key === selectedKey;
      const isIsolated = part.key === isolatedKey;

      // Extract real pharmacokinetic state from currentStep
      let organState = null;
      if (currentStep) {
        if (part.key === 'liver' || part.key === 'gallbladder') {
          organState = currentStep.organs.liver;
        } else if (part.key === 'heart' || part.key === 'coronary_arteries') {
          organState = currentStep.organs.heart;
        } else if (part.key === 'kidney_l' || part.key === 'kidney_r' || part.key === 'bladder') {
          organState = currentStep.organs.kidneys;
        } else if (part.key === 'brain' || part.key === 'brainstem' || part.key === 'cerebellum') {
          organState = currentStep.organs.brain;
        } else if (part.key === 'stomach' || part.key === 'small_intestine' || part.key === 'colon') {
          organState = currentStep.organs.stomach;
        }
      }

      for (const mat of part.materials) {
        const baseColor = (mat.userData.baseColor as THREE.Color) || new THREE.Color(part.color);

        if (stressHeatmapVisible && organState) {
          if (organState.colorState === 'toxic') {
            mat.color.copy(baseColor).lerp(TOXIC_COLOR, 0.65);
            mat.emissive.copy(TOXIC_COLOR);
            mat.emissiveIntensity = isHovered || isSelected ? 0.75 : 0.4;
          } else if (organState.colorState === 'stressed') {
            mat.color.copy(baseColor).lerp(STRESS_COLOR, 0.45);
            mat.emissive.copy(STRESS_COLOR);
            mat.emissiveIntensity = isHovered || isSelected ? 0.65 : 0.3;
          } else {
            // Healthy physiological state
            mat.color.copy(baseColor);
            if (isHovered) {
              mat.emissive.copy(HOVER_HIGHLIGHT_COLOR);
              mat.emissiveIntensity = 0.6;
            } else if (isSelected || isIsolated) {
              mat.emissive.copy(SELECT_HIGHLIGHT_COLOR);
              mat.emissiveIntensity = 0.45;
            } else {
              mat.emissive.copy(ZERO_COLOR);
              mat.emissiveIntensity = 0;
            }
          }
        } else {
          // Normal interactive state without PK stress heatmap
          mat.color.copy(baseColor);
          if (isHovered) {
            mat.emissive.copy(HOVER_HIGHLIGHT_COLOR);
            mat.emissiveIntensity = 0.6;
          } else if (isSelected || isIsolated) {
            mat.emissive.copy(SELECT_HIGHLIGHT_COLOR);
            mat.emissiveIntensity = 0.45;
          } else {
            mat.emissive.copy(ZERO_COLOR);
            mat.emissiveIntensity = 0;
          }
        }
      }
    }
  }, [partsMap, hoveredKey, selectedKey, isolatedKey, stressHeatmapVisible, currentStep]);

  // Per-Frame Animation: Cellular Stress Pulse for actively stressed/toxic organs
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (skinMaterialRef.current) {
      skinMaterialRef.current.uniforms.uTime.value = time;
    }

    if (!stressHeatmapVisible || !currentStep) return;

    for (const part of partsMap.values()) {
      let organState = null;
      if (part.key === 'liver' || part.key === 'gallbladder') {
        organState = currentStep.organs.liver;
      } else if (part.key === 'heart' || part.key === 'coronary_arteries') {
        organState = currentStep.organs.heart;
      } else if (part.key === 'kidney_l' || part.key === 'kidney_r' || part.key === 'bladder') {
        organState = currentStep.organs.kidneys;
      } else if (part.key === 'brain' || part.key === 'brainstem' || part.key === 'cerebellum') {
        organState = currentStep.organs.brain;
      } else if (part.key === 'stomach' || part.key === 'small_intestine' || part.key === 'colon') {
        organState = currentStep.organs.stomach;
      }

      if (!organState || organState.colorState === 'healthy') continue;

      const isHovered = part.key === hoveredKey;
      const isSelected = part.key === selectedKey;

      if (organState.colorState === 'toxic') {
        const pulse = 0.25 + 0.25 * Math.sin(time * 3.5);
        for (const mat of part.materials) {
          mat.emissiveIntensity = isHovered || isSelected ? 0.8 : pulse;
        }
      } else if (organState.colorState === 'stressed') {
        const pulse = 0.15 + 0.15 * Math.sin(time * 2.5);
        for (const mat of part.materials) {
          mat.emissiveIntensity = isHovered || isSelected ? 0.7 : pulse;
        }
      }
    }
  });

  // Natural Medical Raycast Picking:
  // Visible opaque structures intercept the ray directly rather than penetrating into invisible deeper organs
  const pickStructure = (intersections: THREE.Intersection[]): string | null => {
    if (!intersections || intersections.length === 0) return null;

    const visibleHits = intersections.filter(h => h.object.visible);
    if (visibleHits.length === 0) return null;

    // Check if skin is currently in translucent mode (<0.5 opacity)
    const isSkinTranslucent = skinMaterialRef.current && 
      skinMaterialRef.current.visible && 
      (skinMaterialRef.current.uniforms.uOpacity.value < 0.45);

    // If an organ is isolated, prioritize the isolated structure
    if (isolatedKey) {
      const hitIsolated = visibleHits.find(h => h.object.userData.anatomyKey === isolatedKey);
      if (hitIsolated) return isolatedKey;
    }

    // Inspect hits from closest to camera to farthest
    for (const hit of visibleHits) {
      const isSkin = hit.object.userData.isSkin;

      // Pass-through translucent skin if internal structures exist
      if (isSkin && isSkinTranslucent && visibleHits.length > 1) {
        continue;
      }

      let opacity = 1.0;
      if (hit.object instanceof THREE.Mesh && hit.object.material) {
        const mat = hit.object.material;
        if ('opacity' in mat) {
          opacity = (mat as THREE.Material).opacity;
        }
      }

      // If the structure is visibly present and not ghosted, pick it!
      if (opacity >= 0.25) {
        return (hit.object.userData.anatomyKey as string) ?? null;
      }
    }

    return (visibleHits[0]?.object.userData.anatomyKey as string) ?? null;
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    // Ignore while dragging or orbiting
    if (e.buttons) {
      if (hoveredKey) onHover(null);
      return;
    }
    const key = pickStructure(e.intersections);
    onHover(key, { x: e.clientX, y: e.clientY });
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 5) return; // Ignore drag release
    const key = pickStructure(e.intersections);
    onSelect(key);
  };

  return (
    <primitive
      object={root}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => onHover(null)}
      onClick={handleClick}
    />
  );
};
