---
"@equinor/fusion-framework-react-app": patch
---

Internal: Update workspace dependency versions from `workspace:^` to `workspace:*` for better compatibility.

Changed all internal workspace dependencies to use `workspace:*` instead of `workspace:^` to ensure exact version matching within the monorepo. This prevents version mismatch issues when different parts of the framework have conflicting version constraints.
