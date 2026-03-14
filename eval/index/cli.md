# CLI

These queries cover the `@equinor/fusion-framework-cli` (`ffc`) tool that
developers use to create, develop, build, deploy, and authenticate Fusion
applications and portal templates.

When judging results, verify that:
- Commands use the correct binary name (`fusion-framework-cli` or `ffc`) and
  follow the `ffc <category> <command>` pattern (e.g., `ffc app dev`,
  `ffc auth login`). Reject results that invent commands or confuse the
  Fusion CLI with generic Vite/npm scripts.
- Configuration files reference the correct names (`app.manifest.ts`,
  `app.config.ts`, `dev-server.config.ts`) and show the matching
  `define*` helper from the right sub-path import.
- Authentication results distinguish **interactive login** (browser prompt)
  from **CI/CD token mode** (`FUSION_TOKEN` env var). A result that only
  shows one without acknowledging the other is incomplete.
- Deployment results show the correct command sequence — build/pack first,
  then upload/publish with environment and tag options. Reject results that
  skip the build step or confuse `publish` with `upload`.

## How to develop and build a Fusion application locally

- must mention `ffc app dev` or `fusion-framework-cli dev` for starting a local dev server with hot reload
- must mention `ffc app build` or `fusion-framework-cli build` for creating a production bundle
- must mention `app.manifest.ts` and `app.config.ts` as the two configuration files
- should mention `defineAppManifest` and `defineAppConfig` from `@equinor/fusion-framework-cli/app`
- should mention that the `main` or `module` field in `package.json` determines the build output path

## How to authenticate the Fusion CLI for deployment

- must mention `ffc auth login` or `fusion-framework-cli auth login` for interactive browser-based authentication
- must mention `FUSION_TOKEN` environment variable for CI/CD token-based authentication
- must mention `ffc auth token` or `fusion-framework-cli auth token` for retrieving a token after login
- should mention `FUSION_TENANT_ID` and `FUSION_CLIENT_ID` as optional Azure AD overrides
- should mention the `--token` flag available on all commands as an inline alternative

## How to publish and tag a Fusion application

- must mention `ffc app publish` or `fusion-framework-cli publish` or `fusion-framework-cli app publish` for building, uploading, and tagging in one step
- must mention `ffc app pack` or `fusion-framework-cli pack` or `fusion-framework-cli app pack` for creating a distributable bundle archive
- must mention `ffc app tag` or `fusion-framework-cli app tag` for tagging an existing published version
- should mention `--env` flag for environment-specific config and `--tag` for version tagging
- should mention `ffc app config --publish` or `fusion-framework-cli app config --publish` for publishing config separately from the bundle

## How to develop and publish a Fusion portal template

- must mention `ffc portal dev` or `fusion-framework-cli portal dev` for local portal development
- must mention `ffc portal build` or `fusion-framework-cli portal build` and `ffc portal publish` or `fusion-framework-cli portal publish` for building and deploying portal templates
- must mention `portal.manifest.ts` as the required portal manifest file
- should mention `definePortalManifest` from `@equinor/fusion-framework-cli/portal`
- should mention `portal.schema.ts` for defining the portal configuration schema
