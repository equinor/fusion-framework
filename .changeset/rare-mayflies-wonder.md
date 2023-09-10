---
'@equinor/fusion-framework-react': minor
---

Create module provider when creating framework provider

```useModule(...)``` did not work previously within framework (portal) context since no context provider was created
