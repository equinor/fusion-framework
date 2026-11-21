---
"@equinor/fusion-framework-react-components-people-provider": patch
---

Clarify that `PersonController.getPhoto` takes named Azure ID/UPN identifiers, not full person data. Document UPN-to-Azure-ID resolution, the shared Azure-ID-keyed photo cache, and Azure ID precedence when both identifiers are supplied. No API or runtime behavior changes.

Fixes #5088.
