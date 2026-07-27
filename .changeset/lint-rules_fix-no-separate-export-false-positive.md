---
"@equinor/fusion-framework-lint-rules": patch
---

Fix a false positive in `no-separate-export`: re-exporting an identifier that was itself imported into the file (e.g. `import { Foo } from './bar.js'; export { Foo };`) is a legitimate re-export pattern and is no longer flagged. The rule now only reports specifiers whose local name is defined in the same file and then exported separately from its declaration.
