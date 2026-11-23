# 🧬 InSilico-3D: Interactive Multi-Organ Drug Pharmacokinetics & Toxicity Simulator

> A computational alternative to preclinical animal testing featuring full 3D human anatomical visualization and physiologically-based pharmacokinetic (PBPK) simulation.

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.168-black?style=flat&logo=three.js&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🔬 Overview

InSilico-3D addresses the core reason **over 90% of drugs passing animal testing fail in human clinical trials**: interspecies biological discrepancies, reactive metabolite hepatotoxicity, and multi-organ cascading failures. 

Aligned with the **US FDA Modernization Act 2.0**, InSilico-3D replaces animal testing with:
1. **Interactive 3D Human Anatomy:** Authentic NIH/BodyParts3D anatomical meshes across 10 physiological systems and 147 segmented structures with progressive layer dissection (skin, muscles, skeleton, vascular, viscera).
2. **Coupled Pharmacokinetic ODE Engine:** 5-compartment absorption, distribution, metabolism, and excretion (ADME) simulation.
3. **Reactive Metabolite & Glutathione (GSH) Tracking:** Real-time simulation of Phase I CYP450 oxidation vs. Phase II glucuronidation, tracking toxic NAPQI formation and liver necrosis.
4. **Cardiorenal Cross-Talk:** Coupled systemic feedback loop where renal injury throttles clearance, backing up blood concentrations and triggering secondary cardiotoxicity.
5. **Kleiber's Law Allometric Interspecies Engine ($M^{0.75}$):** Side-by-side human vs. rodent comparison demonstrating animal trial false-negatives.

---

## 🏛️ Key Features

- **3D Anatomical Dissection:** Continuous 0%–100% dissection slider peeling skin $\rightarrow$ muscles $\rightarrow$ skeleton $\rightarrow$ deep viscera.
- **10 Physiological Systems:** Independent exploration of Integumentary, Muscular, Skeletal, Nervous, Cardiovascular, Respiratory, Digestive, Urinary, Endocrine, and Reproductive systems.
- **Depth-Aware Raycasting:** Point-and-click organ selection with cursor-tracking clinical telemetry badges (Latin names, FMA IDs, real-time exposure).
- **Benchmark Drug Library:** Pre-configured profiles for Paracetamol, Ibuprofen, Caffeine, and Doxorubicin (chemotherapy), plus a custom molecular builder.
- **Clinical Telemetry & Dossier:** Real-time plasma curves ($C_{\max}, T_{\max}$), liver ALT/AST, kidney eGFR, and exportable regulatory preclinical dossiers (PDF/Print).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/<YOUR_USERNAME>/bio-project.git
cd bio-project

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🧪 Scientific & Mathematical Verification

Run the automated clinical pharmacology test suite:

```bash
npx tsx src/engine/test_engine.ts
```

All 4 benchmark scenarios verify against clinical pharmacology data:
- ✅ **Paracetamol 500mg Therapeutic:** Glutathione buffer 100% intact, healthy liver.
- ✅ **Paracetamol 4000mg Overdose:** Glutathione depleted to 8%, reactive NAPQI spikes, hepatotoxicity triggered.
- ✅ **Mouse Model Interspecies Comparison:** Rapid allometric clearance leaves mouse liver healthy at human-toxic equivalent doses.
- ✅ **Ibuprofen 1600mg Renal Cross-Talk:** Renal eGFR falls to 17%, throttling whole-body clearance.

---

## 📄 Regulatory Context

- **US FDA Modernization Act 2.0 (S.5002):** Authorizes the use of alternatives to animal testing, including in silico computational models and organ-on-a-chip technologies, for drug applications.
- **NIH Tox21 & ClinTox Benchmarks:** QSAR molecular descriptor rules incorporated for predictive organ toxicology.
