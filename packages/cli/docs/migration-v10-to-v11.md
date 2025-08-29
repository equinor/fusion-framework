With v11, we switched to using the Fusion Framework itself for CLI operations. This change was made to reduce maintenance and improve consistency by reusing the same framework modules (such as service-discovery, authentication, and HTTP) in both Node.js and browser environments. By leveraging the Fusion Framework directly, CLI features and integrations stay up-to-date and benefit from shared improvements across the ecosystem.

## Why This Matters
- **Unified experience:** The CLI now behaves more like Fusion apps, making it easier to reason about configuration, authentication, and service discovery.
- **Reduced duplication:** By reusing core modules, bug fixes and new features are shared between CLI and Framework code.
- **Performance:** The framework is now initialized only when needed (e.g., for HTTP calls or authentication), improving startup time and resource usage.

## Package Changes

- The CLI will now resolve source entrypoint by default from `src/(index.tsx|ts)|(main.tsx|ts)` (unless configured otherwise).
- The CLI will resolve the output entrypoint by `main`|`module` in `package.json`.
  - This is to enable serving the application in preview mode (`import.meta.resolve('PACKAGE_NAME')`).

> [!IMPORTANT]
> Ensure your application is compatible with these changes before upgrading.
> ```json
> {
>   "main": "dist/index.js",
> }
> ```

### Deprecated App Command Aliases

The following `fusion-framework-cli app` commands have been renamed:

| Old Command    | New Command |
| -------------- | ----------- |
| build-pack     | pack        |
| build-upload   | upload      |
| build-manifest | manifest    |
| build-publish  | publish     |

> [!WARNING]
> **Deprecated commands will be removed in the next major release.** While they continue to work with warning messages, please migrate to the new commands immediately.

### Option Changes
- **Removed:** `--service` option
- **Use instead:** `--env` for environment selection

## Authentication Changes

Authentication behavior has been updated to improve security and consistency:

- **For CI/CD and automation:** Continue using the `FUSION_TOKEN` environment variable
- **For local development:** Use interactive authentication:
  ```sh
  fusion-framework-cli auth login
  ```

## Migration Checklist

When upgrading from v10 to v11, ensure you:

- **Update command names** in all scripts and CI/CD pipelines:
   - `build-pack` → `pack`
   - `build-upload` → `upload` 
   - `build-manifest` → `manifest`
   - `build-publish` → `publish`
- **Replace `--service` with `--env`** for environment selection
- **Update local development workflow** to use `fusion-framework-cli auth login`
- **Review custom integrations** that may depend on CLI startup behavior (now on-demand)
- **Update documentation** and team guidelines with new command syntax

## Getting Help

For additional information:
- Run `pnpm fusion-framework-cli app --help` to see current command options
- Check the CLI release notes for detailed changes
- Review related documentation: [Authentication](auth.md) and [Application Commands](application.md)

