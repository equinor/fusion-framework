---
"@equinor/fusion-framework-module-msal": patch
---

Prevent infinite automatic token redirects for repeated consent failures (AADSTS65001). Silent token acquisition now propagates non-interaction errors instead of redirecting. MSAL interaction-required errors allow one automatic redirect per authorization request in the tab session; repeated failures preserve the original MSAL error so applications can display it and administrators can correct API pre-authorization or consent. Successful silent/popup token acquisition clears the matching guard. Explicit user-driven (`silent: false`) retries and popup interaction remain available. Browser storage failures reject explicitly instead of risking an unguarded redirect.

Fixes equinor/fusion-core-tasks#3236
