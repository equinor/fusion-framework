---
"@equinor/fusion-framework-cli": minor
---

Add `ai search` command to search the vector store and validate embeddings.

The new command enables semantic search using vector embeddings with support for:
- Configurable result limits
- OData filter expressions for metadata-based filtering
- JSON output option for programmatic use
- Raw metadata output option
- Verbose output mode

Usage: `ffc ai search <query> [options]`

