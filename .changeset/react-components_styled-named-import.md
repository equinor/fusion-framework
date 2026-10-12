---
"@equinor/fusion-framework-react-components-bookmark": patch
"@equinor/fusion-framework-react-components-roles": patch
"@equinor/fusion-framework-dev-portal": patch
---

Import `styled` as a named export from `styled-components`. The default import resolves to the CommonJS module object under native Node ESM, which left `styled.div` undefined; the named export works for bundlers and Node alike.
