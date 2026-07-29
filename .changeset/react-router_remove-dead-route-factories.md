---
"@equinor/fusion-framework-react-router": patch
---

Internal: Remove dead `src/routes/route-factories.ts` barrel file left over from the fusion-lint filename-convention cleanup. It had zero importers and was never wired into the package's public entry point. No change to the public API.
