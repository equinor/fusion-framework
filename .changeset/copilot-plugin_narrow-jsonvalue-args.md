---
"@equinor/fusion-framework-cli-plugin-copilot": patch
---

Fix a build failure caused by `@github/copilot-sdk`'s stricter `JsonValue` typing on tool-call `arguments`. Tool-call detail extraction (`url`/`path`/`load`/`selector`) now narrows the union type before reading properties instead of relying on unchecked optional chaining.
