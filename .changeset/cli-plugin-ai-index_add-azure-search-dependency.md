---
"@equinor/fusion-framework-cli-plugin-ai-index": patch
---

Add `@azure/search-documents` as a dependency to ensure it's automatically installed when users install the plugin. Previously, users had to manually install this peer dependency required by the AI module.
