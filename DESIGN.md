# InSilico design context

The React application serves students and faculty exploring drug disposition. Its existing scenario, anatomy, research, comparison, and report architecture is preserved.

## Visual direction

The current implementation uses Apple-inspired high-contrast minimalism. Graphite panels and a black anatomical stage support off-white text and one blue action accent. The requested system font stack is canonical. Headings use fluid sizing, a 650 weight, and -0.04em tracking. Header content is capped at 1200 px. The anatomy stage and scientific inspector retain their functional workspace layout.

Runtime tokens live in src/index.css. Canvas is #000000, panels #1d1d1f, raised surfaces #29292c, text #f5f5f7, secondary text #b4b4bc, action blue #0071e3, and supporting blue #8cbbff. Spacing tokens use 4, 8, 16, 24, 32, 48, and 64 px. Header glass uses a static translucent fill and backdrop blur. Scientific colors on the atlas represent their existing biological structures.

## Motion and components

usePageMotion.ts owns IntersectionObserver entrances with 80 ms staggering and a passive, requestAnimationFrame-batched scroll offset capped at 8 px. Animation properties are transform and opacity. Reduced motion reveals content immediately and removes parallax. Cleanup removes observers, frames, and listeners. The default state remains visible when enhancement is unavailable.

ViewSwitch.tsx owns accessible view toggles. Shared primary, secondary, and ghost button styles live in src/index.css. Native selects, dialogs, keyboard focus, sliders, chart tables, and research functionality remain integrated. A reserved title region prevents the headline overlapping the model. The resting camera distance is 2.8 units to increase model presence.

## Verification and references

Chromium checks covered desktop, tablet, mobile, all combinations of the two view switches, keyboard interaction, dialog opening/closing, motion preferences, and page errors. Measured contrast was 19.29:1 for body text, 8.17:1 for secondary text, 4.70:1 for primary-button text, 5.38:1 for its hover state, and 7.69:1 for placeholders. These are bounded palette and behavior checks rather than a comprehensive assistive-technology certification.

The atlas retains its attribution and model licenses in public/models. The earlier Framer prototype is a separate design artifact at https://framer.com/projects/Frh1oV5XvNAJWF5djloa . This pass updates the working React app. The build retains a warning for its large lazy 3D chunk. Universal 60 fps performance has not been established.
