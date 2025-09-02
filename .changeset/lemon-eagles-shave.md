---
"@equinor/fusion-imports": patch
---

Changed `esbuild` from `devDependency` to `dependency` to fix Yarn Plug and Play compatibility.

- Fixes issue with Yarn Plug and Play where `@equinor/fusion-imports` tried to access esbuild but it wasn't declared in dependencies
- Moved esbuild from devDependencies to dependencies to resolve the ambiguous require call

Fixes: https://github.com/equinor/fusion/issues/641
