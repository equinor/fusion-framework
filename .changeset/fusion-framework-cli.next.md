---
"@equinor/fusion-framework-cli": major
---

**Major Changes**

- **Rewrite:** The CLI has been rewritten to use Fusion Framework internally, minimizing dependencies and improving performance. It is now a first-class citizen in the Fusion Framework ecosystem, providing a more consistent and integrated experience.
- **Dev Portal Modularization:** The dev portal has been moved to a separate package `@equinor/fusion-framework-dev-server`, enabling modular architecture and independent updates. The dev portal can be configured via `dev-server.config.js` and supports live preview and API mocking.
- **Command Structure:** CLI is now divided into three main groups: `bin` (executable functions), `commands` (CLI commands), and `lib` (for consumers, config, and utilities). This improves organization and modularity.
- **BREAKING:** The `--service` flag has been removed. The CLI now uses service discovery via Fusion environment variables. All `app -build-???` commands are deprecated and will be removed in the next major version.

- **Vite Config and Schema Utilities Removed:** All built-in Vite configuration files, Vite logger, and internal schema validation utilities have been removed from the CLI package. Users should now provide their own Vite configuration and schema validation as needed.

- **New Utility Functions:** The CLI now includes new utility modules for resolving CI/CD metadata (GitHub Actions, Azure DevOps), git commit and remote info, and package metadata. These utilities support advanced scripting and automation scenarios.

**Minor Changes**

- **Portal Config Support:** Added helpers for loading and resolving portal configuration files, with new types and utilities for authoring static or dynamic portal configs. Dev server logic updated to use resolved portal config.
- **Manifest Refactor:** Portal manifest now uses `name` and `templateEntry` for consistency with app manifests. Dev server config and routing updated. Asset paths now use `/@fs` for local development. Improved type safety and schema validation.
- **ESM Modernization:** Refactored CLI to use deepmerge instead of lodash.mergewith, updated all imports to use explicit `.js` extensions, and re-exported all bin entrypoints for ESM compatibility. Updated package.json and tsconfig.json for ESM.

**Patch Changes**

- **Dev Server Config:** Refactored config loading and merging, added `RecursivePartial` type, custom array merge strategy, and improved documentation. Arrays of route objects are now merged by `match` property to ensure uniqueness.
- **Node Version Check:** Added Node.js version check and LTS recommendation to CLI entrypoint. Build config injects version info via environment variables.

**Other**

- Improved maintainability, type safety, and developer experience throughout the CLI and dev server packages.

**Note:**
- The removal of Vite config and schema utilities is a breaking change for users who previously relied on CLI-provided defaults. Please migrate to custom configuration as needed.
- The new utility modules are available for advanced use cases and automation, but do not affect most standard CLI usage.
- If you are authoring an `app.config.ts` file, you now need to import the config helper as follows:

  ```diff
  -import { defineAppConfig } from '@equinor/fusion-framework-cli';
  +import { defineAppConfig } from '@equinor/fusion-framework-cli/app';
  ```

**Further Reading & Documentation Highlights**

+- See the CLI's [README](https://github.com/equinor/fusion-framework/blob/main/packages/cli/README.md) for a full overview, installation, and command reference.
+- The [docs folder](https://github.com/equinor/fusion-framework/tree/main/packages/cli/docs) contains:
+  - [Developing Apps](https://github.com/equinor/fusion-framework/blob/main/packages/cli/docs/application.md): Step-by-step guide to app setup, config, CI/CD, and best practices.
+  - [Developing Portals](https://github.com/equinor/fusion-framework/blob/main/packages/cli/docs/portal.md): Portal template development, manifest/schema, and deployment.
+  - [Authentication](https://github.com/equinor/fusion-framework/blob/main/packages/cli/docs/auth.md): Local and CI/CD authentication, MSAL, and secure token storage.
+  - [Migration Guide: v10 to v11](https://github.com/equinor/fusion-framework/blob/main/packages/cli/docs/migration-v10-to-v11.md): Breaking changes, deprecated commands, and upgrade steps.
+  - [libsecret setup](https://github.com/equinor/fusion-framework/blob/main/packages/cli/docs/libsecret.md): Secure credential storage for Linux users.
+- For real-world examples, see the [cookbooks/](https://github.com/equinor/fusion-framework/tree/main/cookbooks) directory.
- Key usage notes:
  - All config and manifest files must use helpers from `@equinor/fusion-framework-cli/app`.
  - Use `fusion-framework-cli auth login` for local authentication; use `FUSION_TOKEN` for CI/CD.
  - Deprecated commands (`build-pack`, `build-upload`, etc.) are replaced by `pack`, `upload`, etc. Use `--env` instead of `--service`.
  - The CLI supports "build once, deploy many" CI/CD workflows.
  - Utilities like `mergeAppManifests` are available for advanced config/manifest merging.

This consolidated changeset replaces all previous CLI-related changesets for this release.
