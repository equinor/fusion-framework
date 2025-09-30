---
"@equinor/fusion-framework-module-services": patch
---

Made the `jobTitle` field in `ApiPersonSchema` nullable to ensure external users can access bookmarks even when the `jobTitle` field is not set.

ref:[668](https://github.com/equinor/fusion/issues/668)
reporter: [EdwardBrunton](https://github.com/EdwardBrunton)


