---
"@equinor/fusion-framework-vite-plugin-spa": minor
---

Refactor build output and entrypoints for SPA Vite plugin:

- Change main export entrypoint to `./dist/bin/index.js` (was `./dist/esm/index.js`).
- Remove the `./html` export subpath.
- Update Rollup config to bundle from `dist/esm` to `dist/bin` and adjust input/output accordingly.
- Remove `postbuild` script and add `prebuild` script for TypeScript project references build.
- Minor formatting improvements in `package.json`.

These changes improve the build pipeline and clarify the published entrypoints for consumers.
