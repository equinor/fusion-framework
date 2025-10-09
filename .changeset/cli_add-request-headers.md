---
"@equinor/fusion-framework-cli": patch
---

Added default headers to CLI REST API requests for better identification and tracking.

- Created new `defaultHeaders` utility that includes CLI name, version, and user-agent
- Updated app upload/tag operations to include default headers
- Updated portal upload/tag operations to include default headers

All HTTP requests from the CLI now include:
- `x-fusion-cli-name`: Identifies the CLI tool name
- `x-fusion-cli-version`: Specifies the CLI version making the request
- `user-agent`: Standard user agent header with CLI name and version

This enhancement improves observability and helps service owners track and debug CLI interactions with backend services.

Closes: #3539
