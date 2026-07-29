---
"@equinor/fusion-framework-cli": patch
---

Internal: renamed CLI command implementation files to a `*.command.ts` naming convention (e.g. `tag.ts` -> `tag.command.ts`) across `app`, `portal`, and `auth` command groups, replacing a long list of per-file `filename-convention` lint exceptions with a single `*.command.ts` exclude pattern. No behavior change.
