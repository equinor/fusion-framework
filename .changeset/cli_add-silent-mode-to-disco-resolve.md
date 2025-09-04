---
"@equinor/fusion-framework-cli": patch
---

Added `--silent` option to the `disco resolve` command to disable CLI logger output and only output structured JSON results for piping.

- Added `--silent` flag that completely disables the CLI logger and all logging output
- Only outputs the resolved service details as JSON when silent mode is enabled
- Enables piping the command output to other tools (e.g., `jq`, `grep`, etc.)
- Modified logging calls to use optional chaining for silent mode compatibility
- Cleaned up debug console.log statements
