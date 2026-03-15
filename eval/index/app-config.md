# App Configuration

These queries cover runtime app configuration, environment variables, and
persistent settings — the patterns every Fusion app developer uses to access
environment-specific values, store user preferences, and compose module
configurations through the `AppModuleInitiator` callback.

When judging results, verify that:
- Environment variable access (`useAppEnvironmentVariables`) is attributed to
  `@equinor/fusion-framework-react-app`, not a build-time `process.env` pattern.
- App settings hooks (`useAppSetting`, `useAppSettings`) are shown as persistent
  per-user storage, not ephemeral React state.
- The `AppModuleInitiator` configure callback is the standard entry point for
  composing module configurations, not a one-off setup function.
- Results do not confuse runtime app config with CLI build configuration
  (covered in `cli.md`).

## How to access environment variables at runtime in a Fusion app

- must mention `useAppEnvironmentVariables` hook from `@equinor/fusion-framework-react-app`
- must show that environment variables come from the app module's config (`app.getConfig().environment`)
- must mention that the hook returns `{ value, complete, error }` for async loading state
- should mention `app.config.ts` or `defineAppConfig` as the build-time configuration file
- should mention environment-specific config variants (e.g. `app.config.dev.ts`)
- should show a loading/error guard pattern before accessing the values

## How to use app settings for persistent key-value storage

- must mention `useAppSetting` from `@equinor/fusion-framework-react-app/settings` for individual setting access
- must show that `useAppSetting` returns a `[value, setter]` tuple like React state
- must mention `useAppSettings` for accessing all settings as an object
- must show `AppSettings` module augmentation via `declare module` for type-safe setting keys
- should mention status hooks `onLoading` and `onUpdating` for tracking persistence state
- should mention that settings are per-user and automatically persisted

## How to configure module initialization with AppModuleInitiator

- must mention `AppModuleInitiator` type from `@equinor/fusion-framework-react-app` as the configure callback
- must show `configurator.configureHttpClient` for registering named HTTP clients
- must show `configurator.useFrameworkServiceClient` for service-discovery HTTP clients
- should show composing multiple module enables (`enableContext`, `enableNavigation`, `enableBookmark`) in a single configure callback
- should mention `onConfigured` and `onInitialized` lifecycle callbacks on the configurator
- should show that the callback receives `(configurator, { fusion, env })` with access to the Fusion runtime and app environment
