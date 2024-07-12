---
'@equinor/fusion-framework-module-services': major
---

Total rework of api interface for bookmarks.

The current version misrepresents the api, and does not provide a good interface for working with bookmarks. So was decided to rework the api interface to better represent the api, and provide a more robust interface for working with bookmarks. Instead of fixing the current implementation, it was decided to rework the entire module to save time and confusion in the future.

> This module is meant for internal use only, and should not be used directly by applications, so the breaking changes should not affect any applications. Ancestor modules should be updated to reflect the changes in this module.

**BREAKING CHANGES:**
- api client has been updated to reflect the new api endpoints and request/response types
- models have been replaced with infered `zod` schemas
- request and responses are now parsed and validated using `zod` schemas
- file structure has been updated to reflect the new api client structure