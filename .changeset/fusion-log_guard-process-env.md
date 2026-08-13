---
"@equinor/fusion-log": patch
---

Guard the `process.env` access used to detect the current log level so it no longer throws in environments without a Node-style `process` global (e.g. Vitest Browser Mode).
