---
"@equinor/fusion-framework-dev-portal": minor
"@equinor/fusion-framework-vite-plugin-spa": minor
"@equinor/fusion-framework-cli": patch
---

Enable AG Grid Enterprise license injection for the dev-portal by setting a global window key produced from the SPA template environment. The portal reads `window.FUSION_AG_GRID_KEY` to configure the AG Grid module and silence license warnings when a valid key is present. CLI docs now mention the license key setup.

**Usage:**
- In your SPA environment file, set `FUSION_SPA_AG_GRID_LICENSE_KEY=your-license-key-here`.
- The SPA HTML template injects `window.FUSION_AG_GRID_KEY` before bootstrap runs, and the dev-portal picks it up automatically.

Closes: https://github.com/equinor/fusion-core-tasks/issues/93
Resolves: https://github.com/equinor/fusion-core-tasks/issues/92
Solves: https://github.com/equinor/fusion/issues/732
