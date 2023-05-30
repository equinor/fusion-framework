---
'@equinor/fusion-framework-cli': patch
---

Removes requirement of leading slash in `main` attr in `package.json`, meaning
both `"main": "src/index.ts"` and `"main": "/src/index.ts"` will resolve.
