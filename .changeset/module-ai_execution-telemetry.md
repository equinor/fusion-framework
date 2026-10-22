---
"@equinor/fusion-framework-module-ai": minor
---

Report safe operational telemetry for actual AI executions when the host has the telemetry module.

Clients returned by `useModel`, `useEmbed` and `useIndex`, from built-in and custom strategies, now emit one `fusion.ai.<operation>.duration` record per invocation, stream, embedding or search, including tool-bound runnables and retrievers. Each record carries a `success`, `failure` or `cancelled` outcome, and a failure adds one sanitized exception. Records never contain prompts, completions, chunks, embeddings, documents, tool payloads, model names or original errors, and streams produce no per-chunk records. Without telemetry, the strategy's own client is returned unchanged; with telemetry, results, errors and cancellation are unchanged.

`@equinor/fusion-framework-module-telemetry` is a new optional peer dependency.

Refs #5806
