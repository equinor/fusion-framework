---
"fusion-ts-lint-vscode": patch
---

Internal: bundle `minimatch` 11.0.5 instead of 10.2.6 to resolve GHSA-g3hv-75wg-m249. The bundled `vscode-languageclient` is patched to validate glob patterns without `Minimatch#makeRe`, which `minimatch` 11 removed.
