---
"@equinor/fusion-framework-cli": patch
"@equinor/fusion-framework-dev-portal": patch
---

Add missing `react/router` project reference to `dev-portal` tsconfig to fix publish pipeline failure.

The `tsc -b` build step did not know to build `@equinor/fusion-framework-react-router` first, causing Vite to fail when resolving the import during `prepack`. CLI is bumped to trigger a re-publish of the version that failed in CI.