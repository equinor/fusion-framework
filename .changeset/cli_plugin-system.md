---
"@equinor/fusion-framework-cli": major
---

Add plugin system for extensible CLI architecture and new framework configuration utilities.

**Plugin System:**
- Support for optional plugins via `fusion-cli.config.ts` configuration file
- Automatic plugin discovery and loading from project root or CLI package directory
- Plugin registration via package name or direct function imports
- Support for `.ts`, `.js`, and `.json` config file formats

**New Exports:**
- `configureFramework` - Separated framework configuration from initialization for advanced use cases
- `defineFusionCli` - Type-safe utility for defining CLI plugin configurations

**Enhancements:**
- Non-interactive mode support for `create app` command with `--git-protocol`, `--cleanup`/`--no-cleanup`, and `--no-open` options
- Automatic `.env` file loading via dotenv for environment variable support
- Improved error handling and plugin resolution strategies

**Documentation:**
- Added comprehensive AI commands documentation (internal use only)
- Updated README with plugin system usage instructions

