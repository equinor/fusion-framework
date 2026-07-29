---
"@equinor/fusion-framework-lint-core": patch
"@equinor/fusion-framework-lint-rules": patch
"@equinor/fusion-framework-lint-config": patch
"@equinor/fusion-lint": patch
---

Internal: renamed source files to comply with the `filename-convention` lint rule (files renamed to match their primary named export, e.g. `engine.ts` → `LintEngine.ts`, `glob.ts` → `matches-basename-pattern.ts`). No public API changes.
