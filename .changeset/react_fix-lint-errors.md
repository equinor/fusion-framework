---
"@equinor/fusion-framework-react-app": patch
"@equinor/fusion-framework-react-components-people-provider": patch
"@equinor/fusion-framework-react": patch
"@equinor/fusion-framework-react-module-event": patch
"@equinor/fusion-framework-react-router": patch
---

Internal: add missing intent comments for `as`/`as unknown as` type assertions and inline separate re-exports at their definition site, per `fusion-lint`'s `require-intent-comment/type-assertion` and `no-separate-export` rules. No behavior changes.
