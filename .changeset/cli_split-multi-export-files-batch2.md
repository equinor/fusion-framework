---
"@equinor/fusion-framework-cli": patch
---

Internal: split remaining multi-export modules across `bin/utils`, `cli/options`, `lib/app`, `lib/portal`, and `lib/utils` (including `create-dev-server.ts`, `format.ts`, `format-auth-error.ts`, `auth.ts`, `env.ts`, `assert.ts`, `file-exists.ts`, `package-info.ts`, `path-security.ts`, `app-package.ts`, `load-portal-schema.ts`, `portal-manifest.schema.ts`, `portal-manifest.ts`, `pack.ts`) into one-export-per-file modules to satisfy `fusion-lint`'s `single-export-per-file` rule. Public API surface is unchanged — all symbols are still re-exported from the same barrels/subpaths.
