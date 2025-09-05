---
"@equinor/fusion-framework-cli": patch
---

Fixed stdout concatenation issues in CLI commands that output JSON to stdout.

- Replaced `stdout.write()` with `console.log()` for proper newline handling in:
  - `ffc app manifest` command
  - `ffc app config` command  
  - `ffc portal manifest` command
  - `ffc portal config` command
- Removed unused `stdout` imports
- Improved output consistency and piping compatibility

These changes ensure that shell prompts no longer concatenate to JSON output, making the commands safe to pipe to tools like `jq`.
