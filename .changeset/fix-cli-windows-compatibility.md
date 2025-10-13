---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Fix Windows compatibility issue in SPA Vite plugin

Previously, the plugin was using direct `.pathname` access on URL objects which could cause issues on Windows due to path separator differences. This change replaces the direct pathname access with `fileURLToPath()` and `normalizePath()` from Vite to ensure proper cross-platform path handling.

**Changes:**
- Import `normalizePath` from Vite for consistent path normalization
- Use `fileURLToPath()` to properly convert file URLs to paths
- Apply `normalizePath()` to ensure consistent path separators across platforms

This fix ensures the CLI and development server work correctly on Windows systems.