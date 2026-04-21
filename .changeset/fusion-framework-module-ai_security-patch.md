---
"@equinor/fusion-framework-module-ai": patch
---

Patched transitive security vulnerabilities in LangChain dependency tree:

- `handlebars` → 4.7.9 (JS injection via AST type confusion — critical)
- `langsmith` → 0.5.21 (prototype pollution, streaming bypass)
- `lodash` → 4.18.1 (code injection via `_.template`)
- `yaml` → 2.8.3 (stack overflow via deeply nested collections)
