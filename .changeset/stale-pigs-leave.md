---
"@equinor/fusion-framework-app": patch
"@equinor/fusion-framework-cli": patch
"@equinor/fusion-framework": patch
"@equinor/fusion-framework-module-ag-grid": patch
"@equinor/fusion-framework-module-app": patch
"@equinor/fusion-framework-module-context": patch
"@equinor/fusion-framework-module-http": patch
"@equinor/fusion-framework-module": patch
"@equinor/fusion-framework-module-msal": patch
"@equinor/fusion-framework-module-navigation": patch
"@equinor/fusion-framework-module-service-discovery": patch
"@equinor/fusion-framework-module-telemetry": patch
"@equinor/fusion-framework-module-widget": patch
"@equinor/fusion-framework-react-app": patch
"@equinor/fusion-framework-react-components-bookmark": patch
"@equinor/fusion-framework-react": patch
"@equinor/fusion-framework-legacy-interopt": patch
"@equinor/fusion-framework-react-module-bookmark": patch
"@equinor/fusion-framework-react-module-context": patch
"@equinor/fusion-framework-react-module-event": patch
"@equinor/fusion-framework-react-module-http": patch
"@equinor/fusion-framework-react-module": patch
"@equinor/fusion-framework-cookbook-app-react-bookmark-advanced": patch
"@equinor/fusion-framework-cookbook-app-react-bookmark": patch
"@equinor/fusion-framework-cookbook-app-react": patch
---

__🚧 Chore: dedupe packages__

- align all versions of typescript
- update types to build
  - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future  
