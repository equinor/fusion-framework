---
"@equinor/fusion-framework-module": patch
---

Ensure module re-registration replaces prior `configure`, `afterConfig`, and `afterInit` callbacks for modules with the same name. This prevents stale callback execution when mock modules like `enableMsalMock` override a real module registration.
