# Design System Rules & MCP Integration Architecture

This document defines the architectural patterns, tokens, and integration rules for the **InSilico-3D: Multi-Organ Pharmacokinetics & Toxicity Simulator** codebase, structured to enable Figma-to-code synchronization via the Model Context Protocol (MCP).

---

## 1. Token Definitions

### Where tokens are defined
* **Tailwind Configuration:** [tailwind.config.js](file:///D:/BIOLOGY%20PROJECT/DRUG%20ORGAN%20SIMULATOR/tailwind.config.js)
* **Global CSS Utilities & Micro-Interactions:** [src/index.css](file:///D:/BIOLOGY%20PROJECT/DRUG%20ORGAN%20SIMULATOR/src/index.css)
* **Pharmacological & Biological Constants:** [src/engine/types.ts](file:///D:/BIOLOGY%20PROJECT/DRUG%20ORGAN%20SIMULATOR/src/engine/types.ts)

### Token Format & Structure: Ultra-Minimalist Precision Aesthetic
To eliminate visual clutter, heavy puffy drop shadows, and oversized bubble radii, the design system enforces a **Swiss / Linear / Apple Pro Precision Aesthetic**:
* **Surface Foundation:**
  - Background Canvas: `#09090b` (Deep Zinc Obsidian)
  - Card / Panel Surface: `rgba(18, 18, 23, 0.75)` with `backdrop-filter: blur(20px)`
  - Hairline Borders: `1px solid rgba(255, 255, 255, 0.08)` (Razor-sharp, no thick 2px borders)
  - Surface Hover: `rgba(255, 255, 255, 0.03)` with `border-color: rgba(255, 255, 255, 0.16)`
* **Corner Geometry:**
  - Micro-radii: `rounded-lg` (8px) for buttons/inputs, `rounded-xl` (12px) for cards, `rounded-2xl` (16px) for major panels. (Strictly no 36px–50px bloated radii).
* **Sparse Semantic Accent Tokens:**
  - Primary Action / Focus: `#FFFFFF` on `#000000` or crisp Electric Cyan `#06B6D4`
  - Safe Physiological State (Glutathione): `#10B981` (Emerald)
  - Cellular Stress: `#F59E0B` (Amber)
  - Critical Toxicity / Necrosis: `#EF4444` (Rose Crimson)
  - Arterial Circulation: `#FB7185` (Ruby)
  - Venous Circulation: `#38BDF8` (Sky)

---

## 2. Component Library

### Component Architecture
* **Landing & Presentation:** `src/components/landing/LandingPage.tsx`
  - Minimalist Hero with bold typography and hairline feature cards
  - Accordion workflow with clean divider rules
  - Regulatory marquee with subtle monochrome logos
* **3D Canvas & WebGL:** `src/components/canvas/`
  - `AnatomicalTwinScene.tsx` (R3F Canvas root with deep obsidian background `#09090b`)
  - `CameraController.tsx` (Interpolated orbit & camera focus)
  - `HumanBodySilhouette.tsx` (Clean holographic wireframe & translucent silhouette)
  - `VascularNetwork.tsx` (Subtle glowing blood flow particle trails)
  - `organs/` (Procedural meshes for Brain, Heart, Liver, Kidneys, Stomach)
* **HUD & Telemetry Overlays:** `src/components/dashboard/`
  - `HeaderBar.tsx` (Ultra-slim 44px top navbar with hairline border)
  - `DrugAndDoseSelector.tsx` (Compact protocol inspector with segmented tabs and clean micro-sliders)
  - `OrganTelemetryPanel.tsx` (Minimal tabular telemetry and progressive disclosure tabs)
  - `SimulationTimelineScrubber.tsx` (Slim floating bottom scrubber with precision scrub handle)
  - `ViewportControlsOverlay.tsx` (Minimal 32px floating pill bar)

---

## 3. Frameworks & Libraries
* **UI Framework:** React 18 (`react`, `react-dom`) with TypeScript.
* **Styling Framework:** Tailwind CSS 3.4 with PostCSS.
* **3D Rendering Engine:** Three.js (`three`), `@react-three/fiber` (R3F), and `@react-three/drei`.
* **Icons:** `lucide-react` (rendered at clean 14px–16px dimensions with stroke width 1.5).
* **Bundler & Build Tool:** Vite 5.

---

## 4. Asset Management
* SVGs and vector icons are rendered via `lucide-react` inline vectors.
* 3D geometries are generated procedurally in Three.js buffer geometries to avoid static asset overhead and eliminate 404 network fetches.

---

## 5. Icon System
* Clean vector icons from `lucide-react` styled with `w-4 h-4 text-neutral-400` and thin 1.5 stroke weights.
* Icons are placed directly adjacent to labels without heavy decorative background wells.

---

## 6. Styling Approach
* **CSS Methodology:** Functional Tailwind CSS combined with minimal utility classes (`.glass-minimal`, `.hairline-border`, `.micro-slider`).
* **Zero Bloat Rule:** Avoid heavy dual neumorphic shadows, skeuomorphic bevels, or bright multi-color border gradients.
* **Transitions:** Snappy 120ms–150ms transitions (`transition-colors duration-150`).

---

## 7. Project Structure
```
D:\BIOLOGY PROJECT\DRUG ORGAN SIMULATOR\
├── src/
│   ├── components/
│   │   ├── canvas/          # Three.js 3D Viewport & Organ Meshes
│   │   ├── dashboard/       # Sleek Minimalist HUD Overlays
│   │   └── landing/         # Clean Presentation Landing Page
│   ├── engine/              # Mathematical ODE & ML Pharmacokinetics
│   ├── types/               # TypeScript Definitions
│   ├── App.tsx              # Dual-Mode View Router & History
│   ├── index.css            # Minimalist Surface Rules
│   └── main.tsx             # React Root
├── CLAUDE.md                # Design System Reference
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```
