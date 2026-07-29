---
"@equinor/fusion-framework-cli-plugin-ai-base": patch
"@equinor/fusion-framework-cli-plugin-ai-chat": patch
"@equinor/fusion-framework-cli-plugin-ai-index": patch
"@equinor/fusion-framework-cli-plugin-copilot": patch
---

Internal: renamed 53 source files across `ai-base`, `ai-chat`, `ai-index`, and `copilot` to comply with the `filename-convention` lint rule (e.g. `config.ts` → `load-fusion-ai-config.ts`, `tools/write-file.ts` → `tools/create-write-file-tool.ts`, `prompts/plan.prompt.ts` → `prompts/create-plan-prompt.ts`). No public API changes.
