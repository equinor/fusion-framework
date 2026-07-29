---
"@equinor/fusion-framework-cli": patch
---

Internal: split several multi-export modules (`framework.node.ts`, `legacy.ts`, `load-dev-server-config.ts`, `project-templates.schema.ts`) into one-export-per-file modules to satisfy `fusion-lint`'s `single-export-per-file` rule. Public API surface (`@equinor/fusion-framework-cli/bin` and `@equinor/fusion-framework-cli/lib`) is unchanged — all symbols are still re-exported from the same barrels.
