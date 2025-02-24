---
"@equinor/fusion-framework-cli": patch
---

Ensures App Assets plugin emits source as `Uint8Array`, previously it was emitting as `Buffer`, which was not catched by `Typescript` < 5.7.
