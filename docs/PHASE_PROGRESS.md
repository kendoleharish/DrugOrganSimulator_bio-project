# Phase delivery and acceptance record

## Phase 1 — Project audit completed

The React/TypeScript/Vite application and its active component tree were inspected. Existing PK equations, anatomy, camera, timeline, charts, comparison, and reporting were reused. Superseded component descriptions in CLAUDE.md were treated as historical implementation context. Public GLB files match the installed open-anatomy-3d assets by SHA-256. The package supplies CC BY 4.0 model credits, which are now distributed and visible in the app.

## Phase 2 — Scientific feasibility and ML baseline completed

PKSmart human IV records were frozen locally with repository license and digest. The CSV has 1,283 rows. Filtering leaves 1,265 complete positive-half-life rows. Identical four-descriptor vectors are grouped before splitting, giving 989 training and 244 held-out groups. A fixed 15-neighbor model predicts log10 half-life from molecular weight, HBA, HBD, and TPSA with training-only standardization. Reproduce with scripts/train_pk.py and scripts/requirements-ml.txt.

Held-out log10 MAE is 0.435 versus 0.460 for a constant baseline. Median fold error is 2.46. The split allows related scaffolds across partitions. Descriptor calculations may differ between the dataset and PubChem. Query compounds may be represented in training. Mouse, tissue, injury, and oral outcomes are outside this evaluation. This is an experimental baseline with limited predictive performance.

## Phase 3 — Local design implemented; Figma deliverable blocked

An editable Figma file was created at https://www.figma.com/design/JG5A1dpgET7Uz41qcEVz3s . The account then returned its Starter-plan tool quota error. The file remains blank. The local React preview, DESIGN.md, and desktop/mobile review screenshots provide the current visual reference. Team visual approval remains pending. Framer workspace availability was checked. A second hosted application was not created.

## Phase 4 — Core research workflow implemented

The header exposes benchmark, species, clearance scenario, drug research, methods, comparisons, and report actions. PubChem identity lookup supplies source-linked compound candidates and explicit confirmation. No-match, network failure, timeout, and request cancellation paths are present. Confirmed molecular descriptors drive the experimental human IV half-life estimate and its equation-derived elimination illustration. Unsupported compounds retain evidence-only behavior for the organ simulator.

## Phase 5 — Anatomy and visualizations implemented for supported scope

The existing educational male/female anatomy atlas supports orbit, zoom, pan, region selection, focus, isolation, and system/dissection controls. The stage entrance and camera transitions respect reduced motion. Rendering uses demand mode and pauses off-screen or in hidden tabs. The 3D scene loads separately. The inspector provides a keyboard-operable structure directory and remains available when WebGL fails.

Plasma charts have linear/log controls and accessible sampled tables. Species comparison shows mass, volume, clearance, and AUC ratios. Dose comparison calculates half/reference/double input scenarios. Organ overlays represent modeled disposition/elimination. Local tissue injury and calibrated organ concentrations remain unsupported. Atlas materials are educational visualizations. Photorealistic skin and universal 60 fps performance have not been established.

## Phase 6 — Evidence and reporting implemented

Methods & evidence exposes equations, units, benchmark coefficients, limitations, the FDA comparison, a cited paracetamol formulation comparison, ML evaluation, and anatomy credits. PDF includes results, a plotted curve, methods, parameter values, and source links. JSON contains the model version, complete profile, scenario, assumptions, and calculated timeline. Evidence-gap questions are provided as research discussion prompts. The optional generative AI experiment assistant has not been implemented.

## Phase 7 — Responsive and interaction review completed within listed checks

Real Chromium rendered the anatomy. Desktop and fresh mobile captures were visually inspected. Checked widths 1440, 1024, 768, and 390 px showed no horizontal document overflow. Native dialogs support Escape. Chart data tables, visible focus styles, semantic controls, locally bundled Inter, and reduced-motion handling are included. An explicit render invalidation was added for visibility and resize changes. A comprehensive assistive-technology audit and device-specific frame-rate profiling remain unperformed.

## Phase 8 — Verification and package preparation

Verified live PubChem acetaminophen identity (CID 1983), explicit confirmation, and ML display of approximately 3.90 h. The runtime inference function matches an independent NumPy calculation at 3.895391868189189 h for the parity fixture. Browser checks passed for methods, dose/species dialogs, scenario JSON content, PDF file signature/download, log toggle, chart table, no-match handling, and responsive overflow. Captured browser runs reported no page errors. Existing engine tests and TypeScript checks passed. Production builds passed with a large lazy 3D chunk warning. The lookup timeout and no-WebGL changes passed TypeScript checking. Browser verification confirmed the explicit no-WebGL fallback, accessible directory, and network-error recovery. A production bundle smoke check mounted the lazy canvas and controls without page errors. The final production build passed with the documented large lazy-scene warning.

The older human paracetamol model peak remains approximately 52% below the cited FDA mean peak. Three descending-phase points have RMSE 0.116 mg/L. Full-curve and other drug/species accuracy remain unestablished.

## Outstanding deliverables and limits

- Figma screen creation is blocked by account tool quota. The blank file is not a completed design deliverable.
- Team approval of the local visual direction is pending.
- Optional generative AI research support remains unimplemented.
- Physiological and ML predictions have the evidence and domain limits described above.
- Browser checks establish the named behaviors and viewport results. They do not establish universal device performance or comprehensive accessibility certification.

## Framer design alternative

Following the request to use Framer, a design project was created at https://framer.com/projects/Frh1oV5XvNAJWF5djloa . Editable desktop (1200 px) and phone (390 px) layouts were built and visually reviewed. The native text and layout layers use Inter and shared color tokens. The anatomy image is a captured render from the working atlas, clearly labeled as a design preview. The interactive viewer and scientific calculations remain in the React application. Framer returned no remaining linter diagnostics after the border-width fix. The project has not been published.
