# @equinor/fusion-framework-dev-portal

Minimal development portal for building and testing Fusion Framework applications locally.

## What Is It?

`@equinor/fusion-framework-dev-portal` provides a lightweight portal shell that mirrors the production Fusion portal layout — header, context selector, bookmark side sheet, person settings, and application routing — without the full production overhead. It is the portal component loaded by `@equinor/fusion-framework-dev-server` and `@equinor/fusion-framework-cli` when running apps locally.

Use this package when you need a portal host for local app development. For the recommended development workflow, pair it with `@equinor/fusion-framework-dev-server`.

## Key Concepts

- **Portal shell**: A React application that renders the top bar, context selector, and an app mounting area.
- **Application loader**: Dynamically initializes and mounts a Fusion app by its `appKey`, handling manifest resolution, script loading, and teardown.
- **Framework modules**: The portal pre-configures telemetry, navigation, bookmarks, feature flags, analytics, AG Grid, and service integrations so loaded apps inherit a realistic environment.
- **Context navigation**: When an app uses the context module, the portal synchronizes URL navigation with context changes automatically.

## Installation

```sh
pnpm add @equinor/fusion-framework-dev-portal
```

## Environment Variables

Set these in a `.env` file or in your server environment:

| Variable | Required | Description |
|---|---|---|
| `FUSION_MSAL_CLIENT_ID` | Yes | MSAL application client ID for authentication |
| `FUSION_MSAL_TENANT_ID` | Yes | Azure AD tenant ID for authentication |
| `FUSION_SERVICE_DISCOVERY_URL` | Yes | URL for the Fusion service discovery endpoint |
| `FUSION_SERVICE_SCOPE` | Yes | OAuth scopes for service requests |
| `FUSION_SPA_AG_GRID_KEY` | No | AG Grid Enterprise license key — silences console warnings locally |

### AG Grid License

To suppress AG Grid Enterprise license warnings during local development:

1. Add `FUSION_SPA_AG_GRID_KEY=<your-key>` to your `.env` file.
2. Start the dev portal with `pnpm start`.
3. Verify the browser console shows no AG Grid license warnings.

The license key is only used locally and must not be committed to the repository.

## Quick Start

```sh
pnpm start
```

This launches the dev server with the portal loaded.

## Public API

The package exports a single `render` function that mounts the portal into a DOM element:

```ts
import { render } from '@equinor/fusion-framework-dev-portal';

const el = document.createElement('div');
el.id = 'dev-portal';
document.body.appendChild(el);

// `framework` is a pre-configured Fusion Framework instance with Service Discovery and MSAL
render(el, { ref: framework });
```

### Usage with `@equinor/fusion-framework-dev-server`

The dev server loads this portal automatically. A typical integration looks like:

```ts
import { createDevServer } from '@equinor/fusion-framework-dev-server';

const portalId = '@equinor/fusion-framework-dev-portal';
const devServer = await createDevServer({
  spa: {
    templateEnv: {
      portal: {
        id: portalId,
        tag: 'latest',
      },
    },
  },
  api: {
    serviceDiscoveryUrl: 'https://location.of.your.service.discovery',
  },
});
```

## Architecture

The portal is composed of these internal parts:

- **`render`** — Entry point; creates a React root with theme, framework, and people-resolver providers.
- **`configure`** — Configures all framework modules (telemetry, navigation, bookmarks, feature flags, analytics, AG Grid, services).
- **`Router`** — Sets up routes with `react-router-dom` via the navigation module; routes `/apps/:appKey/*` to the app loader.
- **`AppLoader`** — Resolves, initializes, and mounts a Fusion app by key; handles loading states and errors.
- **`Header`** — Top bar with the Fusion logo, context selector, bookmark toggle, and person settings.
- **`ContextSelector`** — Wired to the current app's context module for searching and selecting context items.
- **`useAppContextNavigation`** — Synchronizes URL pathname with context changes for apps that use the context module.

## Constraints

- This portal is for **local development only** and is not intended for production deployment.
- Visuals may differ from the production Fusion portal.
- The portal assumes MSAL and service discovery are configured in the parent framework instance.


