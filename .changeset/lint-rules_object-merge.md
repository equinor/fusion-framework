---
"@equinor/fusion-framework-lint-rules": minor
"@equinor/fusion-framework-lint-config": minor
---

Add `require-intent-comment/object-merge` rule, enabled by default in the `recommended` config at `warn` severity.

The rule flags multi-source object merges that are missing an intent comment:

- `Object.assign(target, ...sources)` calls with one or more source arguments.
- Object or array literals spreading two or more sources, e.g. `{ ...a, ...b }` or `[...a, ...b]`.

A no-op `Object.assign(target)` call (no sources) and single-spread-plus-overrides literals (the common immutable-update pattern, e.g. `{ ...state, enabled: true }`) are intentionally not flagged, so the rule only fires where a merge actually happens and key precedence matters.
