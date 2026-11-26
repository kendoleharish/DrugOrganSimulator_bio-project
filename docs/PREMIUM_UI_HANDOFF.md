# Premium UI update

The working React application uses slate surfaces, silver typography, and a muted blue accent. Inter was retained for continuity. Research actions and scenario settings occupy separate header rows, while the anatomy remains the visual focus.

## Updated components

- Header and research navigation with primary, secondary, and ghost buttons.
- ViewSwitch controls for anatomy tools and the data inspector, using native buttons with role=switch, accessible labels, aria-checked, and aria-controls.
- Selects, range inputs, timeline controls, inspector panels, charts, and dialogs.
- Responsive desktop, tablet, and phone layouts, including a separate mobile heading area above the model.

## Source files

- src/components/ui/Header.tsx contains the updated React markup and action hierarchy.
- src/components/ui/ViewSwitch.tsx contains the small reusable toggle interaction.
- src/index.css owns tokens, button variants, switch states, 240 ms transitions, focus styling, and responsive layout.
- src/components/3d/Scene.tsx preserves the rendered canvas buffer for stable capture during responsive changes. This adds some GPU buffer memory.

## Verification

TypeScript checking and the production build passed. Chromium checks passed at 1440, 1024, 768, and 390 px in all four combinations of view-switch states, with no horizontal overflow. Space toggled the focused switch and panel visibility. Both research and report dialogs opened and closed. The switch duration was 240 ms with normal motion and reduced under the reduced-motion preference. Captured runs reported no page errors. Desktop and mobile renders were reviewed.

Measured contrast for the checked palette pairs was 15.86:1 for body text, 8.42:1 for secondary text, 9.83:1 for primary-button text, and 8.26:1 for placeholder text. These checks do not constitute a comprehensive WCAG audit. Impeccable's static detector flagged Inter as a common font. It was deliberately retained as the existing product family. The lazy 3D chunk retains Vite's large-chunk warning.

This pass updates the React implementation. The separate Framer design prototype retains its earlier layout.

## Run

Use npm ci, then npm run dev. The project also includes a production dist folder.
