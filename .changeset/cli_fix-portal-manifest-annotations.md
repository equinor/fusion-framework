---
"@equinor/fusion-framework-cli": patch
---

Fix portal manifest validation failing due to undefined annotation values.

The `annotations` schema now accepts optional string values, allowing CI/CD environment annotations with undefined fields to pass validation.

Fixes: https://github.com/equinor/fusion-core-tasks/issues/502
