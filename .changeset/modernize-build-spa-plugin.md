---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Update build system and dependencies:

- Switch build script to use Rollup with a new `rollup.config.js` for ESM output
- Add postbuild script to emit TypeScript declarations
- Move all dependencies to devDependencies for clarity
- Add and update Rollup-related devDependencies (including plugins and types)
- Update `pnpm-lock.yaml` to reflect new and updated dependencies
- Minor formatting and consistency improvements in `package.json` and `tsconfig.json`

These changes modernize the build process and improve maintainability for the SPA Vite plugin package.
