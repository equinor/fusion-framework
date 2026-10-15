---
"@equinor/fusion-framework-docs": patch
---

Document the request identification headers. The CLI README explains which `X-Fusion-CLI-*` headers the CLI sends, that dev-server forwarded requests use `X-Fusion-Dev-Server-*` instead, and that the headers are for diagnostics only. The AI module README documents `setDefaultHeaders` for the default model, embedding and index strategies.

Related: https://github.com/equinor/fusion-core-tasks/issues/2207
