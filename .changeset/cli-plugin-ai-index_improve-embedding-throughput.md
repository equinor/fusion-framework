---
"@equinor/fusion-framework-cli-plugin-ai-index": patch
---

Internal: improve embedding throughput by increasing the buffer flush interval from 500ms to 10s and raising batch concurrency from 2 to 3.

The short 500ms flush window caused many small HTTP calls when upstream metadata enrichment was slow, resulting in excessive round-trips to the Azure OpenAI embedding API. With the longer window, documents accumulate into larger batches (up to the 500-doc cap) before dispatch, reducing total API calls significantly.
