---
"@equinor/fusion-framework-vite-plugin-api-service": patch
"@equinor/fusion-framework-vite-plugin-spa": patch
"poc-portal": patch
"@equinor/fusion-framework-dev-portal": patch
"@equinor/fusion-framework-dev-server": patch
"@equinor/fusion-framework-cli": patch
---

**Security:** Update Vite to v7.1.12

This update addresses a security vulnerability in Vite's development server and includes bug fixes for improved compatibility. The update ensures secure development environments and better plugin ecosystem compatibility.

**Changes:**
- Updated Vite from v7.1.10 to v7.1.12
- Includes security fix for development server file system checks
- Includes compatibility fix for CommonJS plugin
- No breaking changes or API modifications

**Security Fix (v7.1.11):**
- **dev**: trim trailing slash before `server.fs.deny` check ([#20968](https://github.com/vitejs/vite/issues/20968))
  - Prevents potential path traversal vulnerability in development server
  - Only affects development environment, not production builds

**Bug Fix (v7.1.12):**
- **deps**: downgrade commonjs plugin to 28.0.6 to avoid rollup/plugins issues ([#20990](https://github.com/vitejs/vite/issues/20990))
  - Improves compatibility with Rollup plugin ecosystem
  - Prevents potential build issues

All packages using Vite as a development dependency are updated to the latest secure version. This is a patch-level security and bug fix update that maintains full compatibility with existing functionality.


closes: https://github.com/equinor/fusion/issues/723