---
"@equinor/fusion-framework-dev-portal": patch
---

Temporarily keep the development portal's EDS palette and native controls in light mode,
including body-mounted overlays, when OS/browser color preferences start dark or change
while the portal is open. The policy applies when the portal mounts; earlier host
bootstrap and authentication are unchanged.

Ref: equinor/fusion-core-tasks#2120.
