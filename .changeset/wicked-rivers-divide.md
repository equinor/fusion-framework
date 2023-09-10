---
'@equinor/fusion-framework-module-services': minor
---

Update people client to reflect Fusion API

- added models for v2 and v4
- added expand logic for person detail `roles` `positions` `contracts` `manager` `companies`
- changed api client to now include args and init (previously args where extracted from call parameters) to correctly type response models