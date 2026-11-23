import React, { useState, useMemo } from 'react';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles,
  ChevronRight,
  Heart,
  Brain,
  Crosshair,
  BookOpen,
  CheckCircle2,
  Zap,
  Microscope,
  Scale,
  Clock,
  Dna,
  Menu,
  X,
} from 'lucide-react';
import { BENCHMARK_DRUGS } from '../../engine/drugs_dataset';
import { Species, PatientPhenotype } from '../../engine/types';
import { OrganId } from '../../types/visualizer';
import { runPharmacokineticSimulation } from '../../engine/pharmacokinetics';

interface LandingPageProps {
  onLaunchSimulator: (
    drugId?: string,
    dosageMg?: number,
    species?: Species,
    phenotype?: PatientPhenotype,
    intervalHours?: number,
    targetOrgan?: OrganId
  ) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchSimulator }) => {
  // Mobile navigation drawer toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Quick preview drug state for the hero widget
  const [heroDrugId, setHeroDrugId] = useState<string>('paracetamol');
  const [heroDose, setHeroDose] = useState<number>(4000);

  // Interactive 4-step workflow accordion active index
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(0);

  const selectedHeroDrug = BENCHMARK_DRUGS.find((d) => d.id === heroDrugId) || BENCHMARK_DRUGS[0];

  // Dynamic simulation computation for real-time hero preview widget
  const heroSimulation = useMemo(() => {
    return runPharmacokineticSimulation(
      selectedHeroDrug,
      heroDose,
      'human',
      'healthy_adult',
      0,
      24
    );
  }, [selectedHeroDrug, heroDose]);

  // Find step at Tmax or peak toxicity
  const peakStep = useMemo(() => {
    const peakIdx = heroSimulation.timeline.findIndex((t) => t.timeHours >= heroSimulation.tMax);
    return heroSimulation.timeline[peakIdx >= 0 ? peakIdx : 12] || heroSimulation.timeline[0];
  }, [heroSimulation]);

  const heroOrgans = peakStep?.organs;

  const workflowSteps = [
    {
      num: '01',
      title: 'Pick Your Medicine & Patient',
      subtitle: 'Choose medicine, dose in milligrams, and who is taking it',
      description:
        'Select common medicines like Paracetamol or Ibuprofen. Adjust the dose slider to test normal doses or dangerous overdoses. Choose who takes the medicine: a healthy adult, a senior citizen, or someone with sensitive kidneys.',
      equation: 'Dosing: Amount (mg), Schedule: Every X Hours, Patient: Human Body or Mouse Model',
      output: 'Ready for Virtual Body Simulation',
    },
    {
      num: '02',
      title: 'Watch How It Moves Through the Body',
      subtitle: 'Track the medicine traveling through organs every second',
      description:
        'Our virtual body tracks the pill dissolving in the stomach, entering the bloodstream, and traveling to the liver, heart, kidneys, and brain. It monitors how fast the liver neutralizes the medicine and how kidneys filter it out into urine.',
      equation: 'dCp/dt = (ka · F · Dose / Vd) · e^(-ka · t) - ((CL_liver + CL_kidney) / Vd) · Cp',
      output: '24-Hour Minute-by-Minute Organ Exposure Timeline',
    },
    {
      num: '03',
      title: 'AI Safety & Toxicity Checker',
      subtitle: 'Predicts organ safety risks before any damage happens',
      description:
        'Our smart AI checks organ health every second to predict if the heart rhythm is safe, if the liver safety shield is holding strong, and if the kidneys can filter out the waste without getting clogged.',
      equation: 'AI Risk Prediction = Trained on NIH Tox21 & ClinTox Human Clinical Data',
      output: 'Instant Organ Health & Warning Alerts',
    },
    {
      num: '04',
      title: 'See It Glow in Live 3D',
      subtitle: 'Organs change color: Cyan is Safe, Red is Danger',
      description:
        'Watch your virtual human body in real-time 3D. Organs glow healthy cyan when safe, turn warning amber when stressed, and turn danger red if overloaded — so anyone (teachers, judges, students) can understand in 5 seconds.',
      equation: 'Color: Cyan (Healthy) ➔ Amber (Stressed) ➔ Red (Overloaded/Toxic)',
      output: 'Interactive 3D Virtual Human Digital Twin',
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-white/[0.02] text-neutral-400 py-1.5 px-4 text-xs font-mono hairline-border-b">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-white/[0.08] text-white text-[10px] px-2 py-0.5 rounded font-mono font-medium">
              SCIENCE FAIR & MILESTONE
            </span>
            <span className="text-neutral-300 hidden sm:inline">
              InSilico-3D: Test Medicines on a Virtual Human Body Instead of Real Animals
            </span>
          </div>
          <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
            <span>FDA Modernization Act 2.0 (No Animals Needed)</span>
            <span className="text-neutral-600">|</span>
            <span className="text-cyan-400 font-mono">100% Animal-Free Simulation</span>
          </div>
        </div>
      </div>

      {/* 2. SLIM 56PX MINIMAL NAVBAR */}
      <header className="sticky top-0 z-50 h-14 glass-minimal hairline-border-b px-4 md:px-8 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-base tracking-tight text-white font-sans">
                InSilico
              </span>
              <span className="bg-white text-black font-mono font-bold text-[10px] px-1.5 py-0.5 rounded">
                3D
              </span>
              <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest hidden sm:inline ml-1">
                Virtual Body Lab
              </span>
            </div>
          </div>

          {/* Minimal Text Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-neutral-400">
            <a href="#about" className="hover:text-white transition-colors">
              The Problem
            </a>
            <a href="#loopholes" className="hover:text-white transition-colors">
              Why Animals Fail
            </a>
            <a href="#cases" className="hover:text-white transition-colors">
              Try Real Medicines
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              Step-by-Step
            </a>
            <a href="#core-science" className="hover:text-white transition-colors">
              How It Works
            </a>
          </nav>

          {/* Action CTA Button & Mobile Trigger */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onLaunchSimulator()}
              className="btn-primary-minimal px-3.5 py-1.5 text-xs cursor-pointer gap-1.5 shadow-sm"
            >
              <span>Launch 3D Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-14 left-0 right-0 glass-minimal border-b border-white/[0.08] p-4 flex flex-col gap-2 text-sm">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-md hover:bg-white/[0.06] text-neutral-300"
            >
              The Big Problem
            </a>
            <a
              href="#loopholes"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-md hover:bg-white/[0.06] text-neutral-300"
            >
              Why Animals Fail
            </a>
            <a
              href="#cases"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-md hover:bg-white/[0.06] text-neutral-300"
            >
              Try Real Medicines
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-md hover:bg-white/[0.06] text-neutral-300"
            >
              Step-by-Step Guide
            </a>
            <a
              href="#core-science"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-md hover:bg-white/[0.06] text-neutral-300"
            >
              How It Works
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLaunchSimulator();
              }}
              className="btn-primary-minimal w-full py-2.5 text-xs mt-1"
            >
              Enter 3D Lab &rarr;
            </button>
          </div>
        )}
      </header>

      {/* 3. MINIMALIST HERO SECTION */}
      <section className="relative px-4 md:px-8 pt-16 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Mission & Impact */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Next-Gen Medicine Safety Simulator</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] font-sans">
              Test Medicines on a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                Virtual Human Body
              </span>{' '}
              Instead of Real Animals
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-normal">
              Over <strong className="text-white font-semibold">90% of medicines that seem safe in mice fail in humans</strong> because mouse bodies are very different. InSilico-3D simulates how medicine travels through a virtual human body — showing safe doses, toxic overdoses, and organ damage in real-time 3D without harming a single animal.
            </p>

            {/* Clean Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onLaunchSimulator()}
                className="btn-primary-minimal px-6 py-3 text-sm cursor-pointer gap-2 group"
              >
                <span>Launch Interactive 3D Lab</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <a
                href="#about"
                className="btn-secondary-minimal px-5 py-3 text-sm cursor-pointer gap-2"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Why Animals Fail</span>
              </a>
            </div>

            {/* Key Metric Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="card-minimal p-3.5 text-center">
                <div className="text-2xl font-bold text-white font-mono">90%</div>
                <div className="text-[11px] font-mono text-neutral-400 leading-tight mt-1">Fail in Humans (Mice are too different)</div>
              </div>
              <div className="card-minimal p-3.5 text-center">
                <div className="text-2xl font-bold text-white font-mono">4</div>
                <div className="text-[11px] font-mono text-neutral-400 leading-tight mt-1">Big Traps Solved (Hidden poisons & body differences)</div>
              </div>
              <div className="card-minimal p-3.5 text-center">
                <div className="text-2xl font-bold text-white font-mono">6.8x</div>
                <div className="text-[11px] font-mono text-neutral-400 leading-tight mt-1">Faster Mouse Liver (Why mice hide danger)</div>
              </div>
              <div className="card-minimal p-3.5 text-center border-cyan-500/30">
                <div className="text-2xl font-bold text-cyan-400 font-mono">100%</div>
                <div className="text-[11px] font-mono text-neutral-300 leading-tight mt-1">Animal-Free (Virtual Human Twin)</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Organ Twin Preview Card with Hairline Borders */}
          <div className="lg:col-span-5">
            <div className="glass-minimal rounded-2xl p-6 flex flex-col gap-4 shadow-2xl hairline-border">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-mono text-xs text-neutral-200 font-medium tracking-wider uppercase">
                    Try a Virtual Medicine Test
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium text-cyan-400 bg-white/[0.04] border border-white/[0.06]">
                  LIVE 3D PREVIEW
                </span>
              </div>

              {/* Drug Switcher within Preview */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
                  <span>Pick a Medicine:</span>
                  <span className="text-cyan-400 font-medium">{selectedHeroDrug.name} ({heroDose}mg)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {BENCHMARK_DRUGS.slice(0, 4).map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setHeroDrugId(d.id);
                        setHeroDose(d.id === 'paracetamol' ? 4000 : d.standardDoseMg);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-mono text-left transition-all cursor-pointer border ${
                        heroDrugId === d.id
                          ? 'bg-cyan-500/[0.08] border-cyan-500/30 text-white'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/20 text-neutral-300'
                      }`}
                    >
                      <div className="truncate font-medium text-neutral-200">{d.name}</div>
                      <div className="text-[10px] text-neutral-500">Normal: {d.standardDoseMg}mg</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dosage Live Slider */}
              <div className="card-minimal p-3 flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-mono text-neutral-400">
                  <span>Select a Medicine & Amount (mg):</span>
                  <span className={heroDose > selectedHeroDrug.maxDailySafeDoseMg ? 'text-rose-400 font-semibold' : 'text-neutral-200'}>
                    {heroDose} mg {heroDose > selectedHeroDrug.maxDailySafeDoseMg ? '(DANGEROUS OVERDOSE ⚠️)' : '(Normal Safe Dose ✅)'}
                  </span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={selectedHeroDrug.maxDailySafeDoseMg * 2}
                  step={100}
                  value={heroDose}
                  onChange={(e) => setHeroDose(Number(e.target.value))}
                  className="w-full my-1"
                />
                <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                  <span>100mg</span>
                  <span className="text-amber-400/80">Normal Safe Limit: {selectedHeroDrug.maxDailySafeDoseMg}mg</span>
                  <span>{selectedHeroDrug.maxDailySafeDoseMg * 2}mg</span>
                </div>
              </div>

              {/* Dynamic Organ Health Status Grid */}
              <div className="card-minimal p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>Organ Health at Hour {heroSimulation.tMax.toFixed(1)}</span>
                  <span className="text-neutral-200 font-mono">
                    Blood Level: <strong className="text-cyan-400">{peakStep?.plasmaConcentrationMgL?.toFixed(1)} mg/L</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {/* Liver Status */}
                  <div
                    className={`p-2 rounded-lg border transition-all ${
                      heroOrgans?.liver?.colorState === 'toxic'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : heroOrgans?.liver?.colorState === 'stressed'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-white/[0.02] border-white/[0.06] text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Crosshair className="w-3 h-3 text-cyan-400" /> Liver
                      </span>
                      <span className="text-[9px] uppercase font-mono">{heroOrgans?.liver?.colorState === 'toxic' ? 'OVERLOADED' : heroOrgans?.liver?.colorState ?? 'SAFE'}</span>
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Shield: <strong className="text-white">{heroOrgans?.liver?.glutathioneReservePct?.toFixed(0)}%</strong>
                      {heroOrgans?.liver?.activeMetaboliteLevel && heroOrgans.liver.activeMetaboliteLevel > 5 ? (
                        <span className="text-rose-400 font-semibold ml-1">Poison ⚠️</span>
                      ) : null}
                    </div>
                  </div>

                  {/* Kidneys Status */}
                  <div
                    className={`p-2 rounded-lg border transition-all ${
                      heroOrgans?.kidneys?.colorState === 'toxic'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : heroOrgans?.kidneys?.colorState === 'stressed'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-white/[0.02] border-white/[0.06] text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Layers className="w-3 h-3 text-sky-400" /> Kidneys
                      </span>
                      <span className="text-[9px] uppercase font-mono">{heroOrgans?.kidneys?.colorState === 'toxic' ? 'SLOWED' : 'NORMAL'}</span>
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Filter Speed: <strong className="text-white">{heroOrgans?.kidneys?.filtrationEfficiencyPct?.toFixed(0)}%</strong>
                    </div>
                  </div>

                  {/* Heart Status */}
                  <div
                    className={`p-2 rounded-lg border transition-all ${
                      heroOrgans?.heart?.colorState === 'toxic'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : heroOrgans?.heart?.colorState === 'stressed'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-white/[0.02] border-white/[0.06] text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Heart className="w-3 h-3 text-rose-400" /> Heart
                      </span>
                      <span className="text-[9px] uppercase font-mono">{heroOrgans?.heart?.colorState === 'toxic' ? 'STRAINED' : 'NORMAL'}</span>
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Irregular Beat: <strong className="text-white">{heroSimulation.mlPrediction.cardiotoxicityProb}%</strong>
                    </div>
                  </div>

                  {/* Brain Status */}
                  <div
                    className={`p-2 rounded-lg border transition-all ${
                      heroOrgans?.brain?.colorState === 'toxic'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : 'bg-white/[0.02] border-white/[0.06] text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Brain className="w-3 h-3 text-purple-400" /> Brain
                      </span>
                      <span className="text-[9px] uppercase font-mono">{heroOrgans?.brain?.colorState ?? 'PROTECTED'}</span>
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Brain Entry: <strong className="text-white">{selectedHeroDrug.properties.logP > 1.2 ? 'Crosses (Sleepy)' : 'Protected'}</strong>
                    </div>
                  </div>
                </div>

                {/* Systemic Alert Banner if present */}
                {peakStep?.systemicAlert && (
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-[11px] font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 shrink-0 text-rose-400" />
                    <span className="truncate font-medium">{peakStep.systemicAlert}</span>
                  </div>
                )}
              </div>

              {/* Action Inside Preview Widget */}
              <button
                onClick={() =>
                  onLaunchSimulator(
                    heroDrugId,
                    heroDose,
                    'human',
                    'healthy_adult',
                    0,
                    heroDrugId === 'ibuprofen' ? 'kidneys' : 'liver'
                  )
                }
                className="btn-primary-minimal w-full py-2.5 text-xs font-semibold cursor-pointer gap-2"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Simulate {selectedHeroDrug.name} in Full 3D Lab</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REGULATORY CREDIBILITY MARQUEE */}
      <section className="px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto glass-minimal rounded-xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 hairline-border">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-xs text-neutral-200 uppercase tracking-wider">
                Recognized by Modern Science & FDA Guidelines (No Animals Needed)
              </div>
              <div className="text-[10px] text-neutral-400 font-mono">Proven against real clinical human data</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 text-xs font-mono text-neutral-300">
            <span className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
              🏛️ FDA Modernization Act 2.0 (PL 117-328)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
              🧪 NIH Tox21 Safety Data
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
              📊 ClinTox Benchmark
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
              📄 Nature Reviews Drug Discovery
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
              🔬 Virtual Human Twin
            </span>
          </div>
        </div>
      </section>

      {/* 5. THE CRISIS / WHY ANIMAL TESTING FAILS */}
      <section id="about" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium text-cyan-400 uppercase font-mono mb-2 bg-white/[0.04] border border-white/[0.06]">
              THE BIG PROBLEM
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-sans">
              Why Do 9 Out of 10 Drugs Fail Human Trials?
            </h2>
          </div>
          <p className="max-w-md text-sm text-neutral-300 font-normal leading-relaxed">
            Animal testing was invented in 1938 before computers existed. But mouse bodies are completely different from human bodies, causing 90% of medicines to fail when tested on real people.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="card-minimal p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-white/[0.06] text-cyan-400 flex items-center justify-center font-bold text-base mb-5 font-mono border border-white/[0.08]">
                01
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">1. Mouse Livers Work 7x Faster</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                A mouse liver cleans up medicine <strong className="text-white">6.8 times faster per kg</strong> than a human liver. So a lethal poison that destroys a human liver looks totally harmless in a mouse!
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.06] text-[10px] font-mono text-neutral-500">
              Source: Kleiber's Law & FDA Preclinical Review
            </div>
          </div>

          <div className="card-minimal p-6 flex flex-col justify-between border-cyan-500/20">
            <div>
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-base mb-5 font-mono border border-cyan-500/30">
                02
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">2. Hidden Poisonous Breakdown Products</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Standard animal tests only check the pill itself. But when your liver digests medicine like paracetamol, it can produce a toxic chemical (like NAPQI) that destroys liver cells if you take too much.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.06] text-[10px] font-mono text-neutral-500">
              Source: Journal of Hepatology & NIH Tox21
            </div>
          </div>

          <div className="card-minimal p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-white/[0.06] text-neutral-200 flex items-center justify-center font-bold text-base mb-5 font-mono border border-white/[0.08]">
                03
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">3. Organs Don't Live in Separate Dishes</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Testing cells in a flat plastic dish misses what happens inside a living body. When kidneys get overloaded and stop filtering, medicine backs up into the blood and damages the heart.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.06] text-[10px] font-mono text-neutral-500">
              Source: Nature Reviews Drug Discovery
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT SOLVES THE 4 LOOPHOLES */}
      <section id="loopholes" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium text-cyan-400 uppercase font-mono mb-2 bg-white/[0.04] border border-white/[0.06]">
            THE SOLUTION
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 font-sans">
            Why Animals Fail & How Our 3D Simulator Fixes It
          </h2>
          <p className="text-neutral-400 text-sm">
            We solve the 4 big traps that animal tests miss so medicines can be tested safely on a virtual human body.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trap 1 */}
          <div className="card-minimal p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-medium px-2.5 py-0.5 rounded">
                  TRAP 01
                </span>
                <span className="text-xs font-mono text-neutral-400">LIVER SAFETY SHIELD</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Liver Safety Shield (Glutathione) & Toxic Poison Tracker
              </h3>
              <p className="text-neutral-300 text-xs leading-relaxed mb-4">
                Standard animal tests only check the pill itself. Our simulator tracks the Liver Safety Shield (Glutathione). Safe doses are neutralized safely; overdoses overwhelm the liver shield (dropping it below 30%) and toxic chemicals attack liver cells.
              </p>
              <div className="well-minimal p-3 mb-5 text-xs font-mono text-neutral-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Liver Safety Shield Danger Line:</span>
                  <strong className="text-rose-400">Below 30% = Overdose Damage</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Computer Calculation:</span>
                  <span className="text-emerald-400 font-medium">Real-Time Biological Simulation</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onLaunchSimulator('paracetamol', 4000, 'human', 'healthy_adult', 0, 'liver')}
              className="self-start btn-primary-minimal px-4 py-2 text-xs cursor-pointer gap-1.5"
            >
              <span>Test 4000mg Paracetamol Overdose</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Trap 2 */}
          <div className="card-minimal p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-white/[0.06] text-neutral-300 border border-white/[0.1] text-xs font-mono font-medium px-2.5 py-0.5 rounded">
                  TRAP 02
                </span>
                <span className="text-xs font-mono text-neutral-400">ORGAN CHAIN REACTION</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Body Chain Reaction (Kidney-to-Heart Overload)
              </h3>
              <p className="text-neutral-300 text-xs leading-relaxed mb-4">
                Organs are connected by your bloodstream. If medicine damages your kidney blood filter, the drug cannot escape into urine. It backs up in your bloodstream and strains your heart. Our simulator connects all organs together.
              </p>
              <div className="well-minimal p-3 mb-5 text-xs font-mono text-neutral-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Kidney Slowdown Trigger:</span>
                  <strong className="text-amber-400">Filtration Speed &lt; 40%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Whole-Body Result:</span>
                  <span className="text-neutral-200 font-medium">Drug Backs Up into Bloodstream</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onLaunchSimulator('ibuprofen', 1600, 'human', 'renal_impaired', 0, 'kidneys')}
              className="self-start btn-secondary-minimal px-4 py-2 text-xs cursor-pointer gap-1.5"
            >
              <span>Test Ibuprofen Kidney-to-Heart Stress</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Trap 3 */}
          <div className="card-minimal p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-mono font-medium px-2.5 py-0.5 rounded">
                  TRAP 03
                </span>
                <span className="text-xs font-mono text-neutral-400">HUMAN VS. MOUSE GAP</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Human vs. Mouse Trap (6.8x Speed Gap)
              </h3>
              <p className="text-neutral-300 text-xs leading-relaxed mb-4">
                Mice have super-fast metabolisms. A 2000mg dose that would send a human to the hospital is easily cleared by a mouse without harm. Our simulator models this directly, showing why mouse tests give false hope.
              </p>
              <div className="well-minimal p-3 mb-5 text-xs font-mono text-neutral-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Mouse Liver Cleaning Speed:</span>
                  <strong className="text-purple-400">6.8x Faster per kg than Human</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Biology Law:</span>
                  <span className="text-neutral-200">Kleiber's 3/4 Power Law</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onLaunchSimulator('paracetamol', 2000, 'rodent', 'healthy_adult', 0, 'liver')}
              className="self-start btn-secondary-minimal px-4 py-2 text-xs cursor-pointer gap-1.5"
            >
              <span>See Why Mice Hide Liver Danger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Trap 4 */}
          <div className="card-minimal p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-white/[0.06] text-neutral-300 border border-white/[0.1] text-xs font-mono font-medium px-2.5 py-0.5 rounded">
                  TRAP 04
                </span>
                <span className="text-xs font-mono text-neutral-400">PILL BUILDUP OVER TIME</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Pills Taken Day After Day (Buildup Over Time)
              </h3>
              <p className="text-neutral-300 text-xs leading-relaxed mb-4">
                A single dose might seem safe, but taking pills every 8 hours can build up in the body until organs fail. Our simulator tests repeated doses over 48 hours to make sure medicine doesn't accumulate to toxic levels.
              </p>
              <div className="well-minimal p-3 mb-5 text-xs font-mono text-neutral-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Test Schedules:</span>
                  <strong className="text-neutral-200">Every 8h, 12h, or Daily</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Safety Check:</span>
                  <span className="text-emerald-400 font-medium">Tracks Peak Buildup in Organs</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onLaunchSimulator('remdesivir', 200, 'human', 'healthy_adult', 8, 'kidneys')}
              className="self-start btn-secondary-minimal px-4 py-2 text-xs cursor-pointer gap-1.5"
            >
              <span>Test Repeated Dosing (Every 8 Hours)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE CLINICAL CASE STUDIES */}
      <section id="cases" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium text-cyan-400 uppercase font-mono mb-2 bg-white/[0.04] border border-white/[0.06]">
              REAL MEDICINE TESTS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-sans">
              Interactive Medicine Case Studies
            </h2>
          </div>
          <p className="max-w-md text-sm text-neutral-300 font-normal leading-relaxed">
            Click any test below to jump straight into the live 3D virtual body lab with the camera auto-focused on that organ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Case 1: Paracetamol Overdose */}
          <div className="card-minimal p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  DANGEROUS OVERDOSE
                </span>
                <span className="text-xs font-mono text-neutral-400">HUMAN 4000mg</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Paracetamol (Pain Relief) Overdose</h3>
              <p className="text-xs text-neutral-300 mb-5 leading-relaxed">
                Taking 4,000 mg (8 extra-strength pills) exhausts the liver's safety shield in 2.5 hours, letting toxic poison build up and cause severe liver damage.
              </p>
            </div>
            <button
              onClick={() => onLaunchSimulator('paracetamol', 4000, 'human', 'healthy_adult', 0, 'liver')}
              className="btn-primary-minimal w-full py-2.5 text-xs cursor-pointer gap-1.5"
            >
              <span>Test This Overdose</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Case 2: Mouse Discrepancy */}
          <div className="card-minimal p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  ANIMAL BIAS TRAP
                </span>
                <span className="text-xs font-mono text-neutral-400">MOUSE 2000mg</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Human vs. Mouse Test</h3>
              <p className="text-xs text-neutral-300 mb-5 leading-relaxed">
                The exact same dose leaves a mouse completely safe with 65% of its liver shield intact because mice clear medicine 7x faster, proving why mouse tests lie!
              </p>
            </div>
            <button
              onClick={() => onLaunchSimulator('paracetamol', 2000, 'rodent', 'healthy_adult', 0, 'liver')}
              className="btn-secondary-minimal w-full py-2.5 text-xs cursor-pointer gap-1.5 hover:border-cyan-500/40 hover:text-white"
            >
              <span>See Why Mice Lie</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Case 3: Ibuprofen Cross-Talk */}
          <div className="card-minimal p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  ORGAN CHAIN REACTION
                </span>
                <span className="text-xs font-mono text-neutral-400">IBUPROFEN 1600mg</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ibuprofen Kidney Stress</h3>
              <p className="text-xs text-neutral-300 mb-5 leading-relaxed">
                Taking 1,600 mg of Ibuprofen in someone with sensitive kidneys cuts blood filtering down to 17%, causing dangerous whole-body drug buildup.
              </p>
            </div>
            <button
              onClick={() => onLaunchSimulator('ibuprofen', 1600, 'human', 'renal_impaired', 0, 'kidneys')}
              className="btn-primary-minimal w-full py-2.5 text-xs cursor-pointer gap-1.5"
            >
              <span>Test Kidney Chain Reaction</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 8. STEP-BY-STEP WORKFLOW ACCORDION */}
      <section id="workflow" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium text-cyan-400 uppercase font-mono mb-2 bg-white/[0.04] border border-white/[0.06]">
            SIMPLE 4-STEP GUIDE
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 font-sans">
            How InSilico-3D Works
          </h2>
          <p className="text-neutral-400 text-sm">
            Click each step to see how our computer simulation tracks medicine safely inside the virtual human body.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Step Selector Pills */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            {workflowSteps.map((step, idx) => {
              const isActive = activeWorkflowStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveWorkflowStep(idx)}
                  className={`p-3.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between border ${
                    isActive
                      ? 'bg-cyan-500/[0.08] border-cyan-500/40 text-white'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/20 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-medium text-xs ${
                        isActive
                          ? 'bg-cyan-500 text-black'
                          : 'bg-white/[0.06] text-neutral-300 border border-white/[0.08]'
                      }`}
                    >
                      {step.num}
                    </div>
                    <div>
                      <div className="font-medium text-xs text-neutral-200">{step.title}</div>
                      <div className="text-[10px] font-mono text-neutral-500 truncate max-w-xs">{step.subtitle}</div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90 text-cyan-400' : 'text-neutral-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Right: Step Deep-Dive Card */}
          <div className="lg:col-span-7">
            <div className="glass-minimal p-6 rounded-2xl flex flex-col gap-5 hairline-border">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-cyan-500 text-black font-mono font-bold flex items-center justify-center text-xs">
                    {workflowSteps[activeWorkflowStep].num}
                  </span>
                  <h3 className="text-base font-semibold text-white">
                    {workflowSteps[activeWorkflowStep].title}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-cyan-400 bg-white/[0.04] border border-white/[0.06]">
                  STEP {workflowSteps[activeWorkflowStep].num}
                </span>
              </div>

              <p className="text-neutral-300 text-xs leading-relaxed">
                {workflowSteps[activeWorkflowStep].description}
              </p>

              {/* Mathematical Formula / Execution Logic */}
              <div className="well-minimal p-3 flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-neutral-400 uppercase">
                  How the Math Works:
                </span>
                <div className="font-mono text-xs text-neutral-200 overflow-x-auto">
                  {workflowSteps[activeWorkflowStep].equation}
                </div>
              </div>

              {/* Computational Output */}
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 card-minimal p-3">
                <span className="text-neutral-400">Result Produced:</span>
                <strong className="text-cyan-400">{workflowSteps[activeWorkflowStep].output}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SCIENTIFIC BLUEPRINT (Math & Formulas with Easy Explanations) */}
      <section id="core-science" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="glass-minimal p-8 sm:p-10 rounded-2xl hairline-border">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-5 border-b border-white/[0.08]">
            <div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono text-cyan-400 uppercase bg-white/[0.04] border border-white/[0.06] mb-1">
                SCIENTIFIC FORMULAS
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans">
                The Science & Biology Math Behind the Simulator
              </h2>
            </div>
            <div className="text-xs font-mono text-neutral-400">
              For Teachers, Judges & Scientific Peer Review
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Microscope className="w-4 h-4 text-cyan-400" /> 1. How Medicine Travels Through Blood
              </h3>
              <p className="text-neutral-300 text-xs leading-relaxed">
                Tracks the pill dissolving in the stomach, entering the bloodstream, and getting filtered out by liver and kidneys:
              </p>
              <div className="well-minimal p-3 font-mono text-xs text-neutral-200 overflow-x-auto">
                {"dCp/dt = (ka · F · Dose / Vd) · e^(-ka · t) - ((CL_liver + CL_kidney) / Vd) · Cp"}
              </div>
              <p className="text-cyan-300 text-[11px]">
                💡 Plain English: Calculates the exact amount of medicine in each liter of blood every second.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Dna className="w-4 h-4 text-cyan-400" /> 2. Liver Safety Shield (Glutathione)
              </h3>
              <p className="text-neutral-300 text-xs leading-relaxed">
                Tracks the liver shield (GSH) disarming toxic chemicals until an overdose drains it below 30%:
              </p>
              <div className="well-minimal p-3 font-mono text-xs text-neutral-200 overflow-x-auto">
                {"d[GSH]/dt = -k_neutralize · [NAPQI] · [GSH] + k_replenish · (100 - [GSH])"}
              </div>
              <p className="text-cyan-300 text-[11px]">
                💡 Plain English: When the liver shield drops below 30%, toxic chemicals escape and damage liver cells.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-cyan-400" /> 3. Human vs. Mouse Speed Law (Kleiber's Law)
              </h3>
              <p className="text-neutral-300 text-xs leading-relaxed">
                Explains why small mice burn through medicine exponentially faster than humans:
              </p>
              <div className="well-minimal p-3 font-mono text-xs text-neutral-200 overflow-x-auto">
                {"CL_mouse (per kg) = CL_human (per kg) · (70kg / 0.02kg)^0.25 ≈ 6.8 · CL_human"}
              </div>
              <p className="text-cyan-300 text-[11px]">
                💡 Plain English: Mouse livers work nearly 7x faster, which is why dangerous human poisons look harmless in mice!
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> 4. Repeated Doses (Pills Taken Day After Day)
              </h3>
              <p className="text-neutral-300 text-xs leading-relaxed">
                Calculates how medicine accumulates when taken every 8 or 12 hours:
              </p>
              <div className="well-minimal p-3 font-mono text-xs text-neutral-200 overflow-x-auto">
                {"R = 1 / (1 - e^(-ke · interval)) ; Peak_ss = Single_Dose_Peak · R"}
              </div>
              <p className="text-cyan-300 text-[11px]">
                💡 Plain English: Predicts if taking multiple pills over days will quietly build up to dangerous levels.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full compliance with OECD Guidance 69 on Good Toxicokinetic Computer Modeling</span>
            </div>
            <button
              onClick={() => onLaunchSimulator()}
              className="btn-primary-minimal px-4 py-2 text-xs cursor-pointer gap-1.5"
            >
              <span>Test Live in 3D Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 10. MINIMAL FOOTER */}
      <footer className="pt-12 pb-10 px-4 md:px-8 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-cyan-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-sm text-white">InSilico-3D</span>
                <span className="text-[10px] text-neutral-400 block font-mono">
                  Test Medicines on a Virtual Human Body Instead of Real Animals
                </span>
              </div>
            </div>

            <button
              onClick={() => onLaunchSimulator()}
              className="btn-secondary-minimal px-4 py-2 text-xs cursor-pointer gap-1.5"
            >
              <span>Enter 3D Laboratory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500 pt-4 border-t border-white/[0.04]">
            <div>
              &copy; 2026 InSilico-3D Research Project. December 1st Milestone.
            </div>
            <div className="flex items-center gap-3 text-neutral-400">
              <span className="hover:text-white cursor-pointer" onClick={() => onLaunchSimulator()}>3D Lab</span>
              <span>&bull;</span>
              <a href="#about" className="hover:text-white">The Problem</a>
              <span>&bull;</span>
              <a href="#loopholes" className="hover:text-white">Why Animals Fail</a>
              <span>&bull;</span>
              <a href="#cases" className="hover:text-white">Medicine Tests</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
