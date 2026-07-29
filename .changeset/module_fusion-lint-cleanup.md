---
"@equinor/fusion-framework-module": patch
---

Internal: resolved all fusion-lint diagnostics in `@equinor/fusion-framework-module` (TSDoc completeness, intent comments for control flow/iterators/rxjs pipelines, and single-export-per-file/filename-convention violations). Several internal files were split and/or renamed for clarity (e.g. `logger.ts` -> `ConsoleLogger.ts`/`ModuleConsoleLogger.ts`, `semantic-version.ts` -> `SemanticVersion.ts`, and the configurator lifecycle phase files were split so each phase function lives in its own module). All public exports from the package entrypoint are unchanged — no breaking changes for consumers.

Fixes: https://github.com/equinor/fusion-framework/issues/5145, https://github.com/equinor/fusion-framework/issues/5146
