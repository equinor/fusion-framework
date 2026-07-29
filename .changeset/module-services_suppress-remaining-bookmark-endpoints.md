---
"@equinor/fusion-framework-module-services": patch
---

Internal: suppress `no-separate-export` fusion-lint diagnostics on the remaining bookmark endpoint files, matching the pattern already applied to `user-bookmark-favourite.post.ts`. These files intentionally alias shared generic type/function names (`AllowedVersions`, `MethodArg`, ...) to unique consumer-facing export names, which cannot be expressed as an inline export.
