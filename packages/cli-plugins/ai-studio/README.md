# @equinor/fusion-framework-cli-plugin-ai-studio

Experimental local write server for Fusion Framework apps.

## Features

- WebSocket protocol for chat and change set lifecycle
- Streaming assistant token events
- Proposed file diffs before write
- Manual apply/reject flow
- Path traversal and symlink escape protection
- Optional JSONL audit logs under `.live-ai/sessions`

## Usage

```sh
pnpm fusion-live-ai --port 8787
```

Or from code:

```ts
import { startServer } from '@equinor/fusion-framework-cli-plugin-ai-studio';

const server = await startServer({ root: process.cwd(), port: 8787 });
```
