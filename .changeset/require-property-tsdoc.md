---
"@equinor/fusion-framework-lint-rules": minor
"@equinor/fusion-framework-lint-config": minor
---

Add `require-property-tsdoc` rule: requires class field (property) declarations — including Lit's `@property()` / `@state()` decorated fields — to have a preceding TSDoc block comment. `private`/`#name` and `static` fields are exempt. Included in the `recommended` rule preset.
