---
"@equinor/fusion-framework-cli-plugin-ai-index": patch
---

Internal: Remove dead `src/bin/create-file-stream.ts` left over from the fusion-lint file-splitting cleanup. Its `createFileStream` export had zero importers and was superseded by the actively-used, diverged local `createFileStream$` in `embed.ts`. No change to CLI behavior.
