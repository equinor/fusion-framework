---
"@equinor/fusion-framework-cli": patch
---

Internal: Remove dead code left over from the fusion-lint file-splitting cleanup — `src/lib/app/assert-package.ts`, `resolve-app-package.ts`, `resolve-entry-point.ts`, and `src/lib/utils/assert-file-exists.ts`, `assert-git-repository.ts`, `assert-number.ts`, `assert-object-entries.ts`, `fetch-multiple-package-info.ts` had zero importers and were not exported from any package entry point. Also consolidate the `src/bin/helpers/template-*-schema.ts` cluster (5 tiny mutually-referencing zod schema files) into a single `template.schemas.ts`. No change to the public API or CLI behavior.
