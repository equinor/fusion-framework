---
"@equinor/fusion-framework-module-app": patch
---

Remove deprecated `endpoints` getter and improve immutability of AppConfig.

- Removed deprecated `endpoints` getter that was replaced by `getEndpoint()` method
- Improved constructor to use `structuredClone()` for deep cloning of configuration objects
- Applied `deepFreeze()` to endpoints to ensure immutability
- Reduces console warnings and encourages use of the modern `getEndpoint()` API
