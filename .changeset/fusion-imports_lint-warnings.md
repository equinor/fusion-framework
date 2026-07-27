---
"@equinor/fusion-imports": patch
---

Internal: resolve `fusion-lint` warnings (`require-intent-comment`, `single-export-per-file`). Split `FileNotFoundError` and `FileNotAccessibleError` out of `error.ts` into individual files under `errors/` to resolve `single-export-per-file` without conflicting with TSDoc adjacency, and added intent comments to control-flow blocks (`if`/`for`/`switch`/`continue`) across `error.ts`, `import-config.ts`, `import-meta-resolve-plugin.ts`, `import-script.ts`, `resolve-config-file.ts`, and `tests/setup.ts`.
