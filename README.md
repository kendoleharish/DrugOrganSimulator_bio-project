# InSilico-3D

An educational React and TypeScript workstation for exploring drug disposition alongside interactive male and female anatomical models. Select a drug, administration route and schedule, inspect the simulated plasma curve, and explore structures with the 3D dissection controls. The species comparison contrasts equal mg/kg scenarios. The PDF records the current simulation settings and results.

## Run locally

Use a recent Node.js LTS installation with npm.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Use a WebGL-capable browser for the 3D viewport.

## Verification

```sh
npm test
npm run validate
npm run build
```

## Scientific scope

The oral depot and apparent central distribution volume describe systemic pharmacokinetics. Liver and kidney overlays track elimination. A human paracetamol example illustrates NAPQI formation and glutathione demand. The atlas includes many additional structures for anatomical exploration. The simulator supports teaching and model comparison. It cannot determine a safe dose, predict injury or guide care.

- [Model assumptions and parameter register](docs/MODEL_ASSUMPTIONS.md)
- [Validation experiment and limitations](docs/VALIDATION.md)
- [Scientific references](docs/REFERENCES.md)

## Research tools

Research a drug retrieves a confirmed PubChem identity and molecular descriptors. Its experimental model estimates human IV half-life using a fixed 15-neighbor regressor trained on PKSmart data. The interface shows held-out error and applicability limits. The model has limited accuracy, with median held-out fold error of 2.46. This estimate has its own equation-derived elimination illustration. The benchmark simulator continues to use its explicit parameter profiles.

Methods & evidence contains equations, the parameter register, published comparison data, ML evaluation, and anatomy credits. Compare doses displays half/reference/double input scenarios. Compare displays human/mouse curves and parameter ratios. Export report provides PDF and scenario JSON.

To reproduce ML training with Python, install scripts/requirements-ml.txt and run python scripts/train_pk.py from this directory. The frozen CSV, repository license, evaluation metadata, and source digest are in data/research. The browser model is public/research/half-life-model.json.

The body assets are educational anatomical atlas models. Attribution and licensing are in public/models and visible in Methods & evidence. Inter typography is bundled with its font license in public/fonts.

Figma tool quota prevented completing the editable Figma artifact. The local app and desktop/mobile screenshots in docs provide the current design reference. Framer workspace availability was checked. The runnable implementation remains in this React project.
