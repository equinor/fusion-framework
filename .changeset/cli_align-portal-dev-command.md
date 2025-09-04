---
"@equinor/fusion-framework-cli": patch
---

Aligned portal dev command options with app dev command for consistency.

- Standardized option format from short flags to long flags (--debug, --port)
- Added --env option support for runtime environment configuration
- Updated logging message to be portal-specific ("Starting portal in development mode...")
- Enhanced startPortalDevServer function call to include env parameter
