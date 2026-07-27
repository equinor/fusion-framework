---
"@equinor/fusion-framework-cli": patch
---

Internal: add missing TSDoc `@returns`/`@throws` tags and fix TSDoc-comment placement (where a stray line comment or import statement separated the doc block from its declaration) to satisfy `fusion-lint`'s `require-tsdoc` rule. No behavior changes.
