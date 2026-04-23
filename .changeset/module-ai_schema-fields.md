---
"@equinor/fusion-framework-module-ai": minor
---

Add `schemaFields` to `VectorStoreDocumentMetadata` and direct-write path in `AzureVectorStore`.

When documents carry `metadata.schemaFields`, the Azure vector store bypasses LangChain's hardcoded document shape and writes promoted fields as top-level Azure Search properties via the search client. Reserved field names (`id`, `content`, `content_vector`, `metadata`) are automatically stripped to prevent collisions. Mixed embedding batches (partially pre-computed) are handled efficiently by only computing embeddings for documents that lack them.

ref: equinor/fusion-core-tasks#1011
