---
"@equinor/fusion-framework-module-http": patch
"@equinor/fusion-framework-react-module-http": patch
---

Fix published ESM so the packages resolve under native Node ESM, including through `@equinor/fusion-framework-react-app/http`.

Relative imports in the emitted `dist/esm` output previously had no file extension (for example `./client`), which bundlers accept but Node rejects with `ERR_MODULE_NOT_FOUND`. This affected consumers running Vitest with externalized dependencies. Both packages now declare `"type": "module"` and every relative import is emitted with an explicit `.js` extension. `@equinor/fusion-framework-module-http` compiles with `NodeNext` module resolution, which enforces the extensions at compile time.

Ref: https://github.com/equinor/fusion-core-tasks/issues/2014
