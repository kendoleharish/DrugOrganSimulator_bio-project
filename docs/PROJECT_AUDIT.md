# Existing project audit

The supplied ZIP boots React through `src/main.tsx` and `src/App.tsx`. The active scene uses the provided male and female GLB files, the structure catalog and React Three Fiber. The alternate canvas, dashboard and procedural organ experiments were outside this entry point. Superseded prototype files are preserved in `archive/original-prototypes.zip`.

The original Vite development server started on localhost and its production build succeeded with a bundle-size warning. Its build command did not run TypeScript checking. The original engine advanced the initial dose before recording time zero, marked every repeated-dose schedule as steady state, and used fixed multipliers to display concentrations in unmodeled organs. The classifier used hand-written arithmetic and had no training or test dataset.

## Implementation record

| Area | Principal files | Verification |
| --- | --- | --- |
| Scientific labels and model scope | Header, Scene, ClinicalOrganDossier, anatomyMetrics, SpeciesComparisonModal | Standalone typecheck and active import review |
| Drug disposition | pharmacokinetics, types, drugs_dataset, allometric_scaling | Conservation, analytic reference and event tests |
| Empirical comparison | validation, test_engine, run_validation, PlasmaChart | Digitized observations, peak discrepancy and one-at-a-time sensitivity |
| Interface | App, DissectionControls, TimelineController, AnatomicalHumanModel, index.css | Shared simulation result drives timeline, inspector and chart |
| Export | ReportModal | Generates a PDF with run settings, axis labels and simulated values |

The color overlay displays a share of the administered mass. Both kidneys show the same combined renal output. A structure without a compartment remains available for anatomical inspection. The model computes an illustrative glutathione requirement under complete conjugation. Absolute intracellular glutathione and tissue injury require additional data.


Chromium checks covered the rendered GLB, desktop and mobile layout, the species comparison, PDF download, and recovery from a simulated model-download failure. TypeScript, engine tests and the Vite production build passed. Vite reported a large bundle for the 3D entry point.
