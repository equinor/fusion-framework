---
"@equinor/fusion-framework-cli-plugin-ai-base": major
---

**BREAKING:** Replace Azure API key options with Fusion service discovery options.

CLI options now use `--env`, `--token`, `--tenant-id`, `--client-id`, `--chat-model`, `--embed-model`, and `--index-name` instead of `--openai-api-key`, `--openai-instance`, `--azure-search-endpoint`, etc. The `setupFramework` function bootstraps MSAL authentication and resolves the AI service endpoint via Fusion service discovery.

Ref: https://github.com/equinor/fusion-framework/issues/1008
