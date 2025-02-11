---
'@equinor/fusion-framework-cookbook-app-react-ag-grid': patch
---

---

## "@equinor/fusion-framework-cookbook-app-react-ag-grid": patch

Updated the package to use `@equinor/fusion-framework-react-ag-grid` instead of `@equinor/fusion-framework-module-ag-grid`.

- Replaced `@equinor/fusion-framework-module-ag-grid` with `@equinor/fusion-framework-react-ag-grid` in `package.json`.
- Updated imports in `App.tsx` and `config.ts` to use `@equinor/fusion-framework-react-ag-grid`.
- Modified `tsconfig.json` to use `react-jsx` instead of `react-jsxdev`.
- Added `app.manifest.config.ts` to define the app manifest.
