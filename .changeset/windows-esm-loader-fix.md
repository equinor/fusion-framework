---
"@equinor/fusion-imports": patch
---

Fixed Windows compatibility issue with ESM loader when importing bundled scripts.

- Added `pathToFileURL` conversion before importing bundled scripts to prevent `ERR_UNSUPPORTED_ESM_URL_SCHEME` errors on Windows
- Windows absolute paths like `C:\path\to\file.js` are now properly converted to `file:///C:/path/to/file.js` URLs before being passed to the ESM loader
- This ensures cross-platform compatibility for dynamic imports in the CLI and build tools

The fix addresses the root cause of Windows ESM loader errors where Node.js would interpret Windows drive letters as URL protocols.

This fixes https://github.com/equinor/fusion/issues/642

The issue affects not only Windows but any environment where file paths contain characters that ESM might interpret as URL components (e.g., paths with special characters, drive letters, or percent-encoded characters).
