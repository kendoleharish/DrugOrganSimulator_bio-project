# Apple-inspired UI handoff

## Rationale

React is retained to integrate the existing 3D viewer and scientific controls. A graphite and off-white palette, system typography, larger headlines, and translucent navigation give the model a focused presentation while preserving the current information architecture.

## Interaction details

- IntersectionObserver-driven, one-time opacity/transform entrances.
- 80 ms sibling stagger and cubic-bezier(0.16, 1, 0.3, 1) easing.
- Passive scroll handling with a single queued animation frame and a stage offset capped at 8 px.
- Button hover lift, pressed scale, visible keyboard focus, and 240 ms switch-thumb transitions.
- Reduced-motion preferences reveal all content and remove parallax.

## Checkpoints and stop condition

The work proceeded through inspection, implementation, and browser verification. TypeScript and production builds passed. Chromium checks passed for all four combinations of view switches at 1440, 1024, 768, and 390 px, keyboard switches, focus outlines, dialogs, title/model separation, normal-motion stagger, bounded parallax, and reduced-motion output. Captured runs reported no page errors. Impeccable's static detector returned no findings for the reviewed CSS, hook, and App files. The requested implementation and listed verification are complete.

The large lazy 3D chunk warning remains. Frame-rate performance depends on the device and anatomy workload. No universal 60 fps result is claimed.

## Run

Extract the project, run npm ci, then npm run dev. The archive includes production output, source, research data, and licensed model assets. Code blocks for frontend source and configuration are provided in the separate source document. This update applies to the React app. The Framer prototype retains its previous design.
