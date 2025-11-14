---
"@equinor/fusion-framework-cli": minor
---

Add new `ai` command with `chat` and `embeddings` subcommands for LLM integration and document processing.

The CLI now supports interactive AI chat and document embedding utilities for processing codebase documentation and generating vector embeddings for search indexing.

**New Commands:**
- `ffc ai chat` - Interactive chat with AI models
- `ffc ai embeddings` - Document embedding utilities for AI processing

**Features:**
- Interactive chat interface with conversation history
- Document chunking and embedding generation
- Support for markdown and TypeScript documentation parsing
- Git metadata extraction for context-aware embeddings
- Vector store integration for search indexing

