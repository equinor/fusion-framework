---
"@equinor/fusion-framework-lint-config": patch
---

Internal: depend on `@equinor/fusion-imports` through the `workspace:^` protocol instead of a registry range.

The registry range was rewritten to an unpublished pre-release version during `changeset version`, which broke installs on the `next` branch.
