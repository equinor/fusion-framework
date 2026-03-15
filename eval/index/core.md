# Core

Ensure results reference `@equinor/fusion-framework` or `@equinor/fusion-framework-module` packages.
Verify that returned symbols, configuration helpers, and lifecycle hooks are real exports.
Reject results that use relative cross-package imports instead of scoped `@equinor/` imports.

## How to initialize Fusion Framework

- must mention `FrameworkConfigurator` from `@equinor/fusion-framework`
- must mention `init` function that bootstraps the framework
- must show `configureMsal` and `configureServiceDiscovery` as configuration helpers
- should mention `window.Fusion` assignment and `onFrameworkLoaded` event
- should note that `FusionConfigurator` is deprecated in favor of `FrameworkConfigurator`
- should mention apps inside a portal use `@equinor/fusion-framework-react-app` instead

## How to create a custom module

- must reference `Module` interface from `@equinor/fusion-framework-module`
- must show a module with `name`, `configure`, and `initialize` properties
- must mention `BaseConfigBuilder` for declarative config builders
- must mention `BaseModuleProvider` from `@equinor/fusion-framework-module/provider`
- should show `ConfigBuilderCallback` type for typed setters
- should note `ModuleConfigBuilder` is deprecated — use `BaseConfigBuilder`

## Module lifecycle phases

- must describe the lifecycle order: configure → postConfigure → initialize → postInitialize → dispose
- must mention `ModulesConfigurator` as the orchestrator
- must explain `requireInstance` for cross-module dependencies during initialization
- should note `configure` and `initialize` are required; other hooks are optional
- should mention `postInitialize` receives the full `modules` map

## How to configure an app with AppModuleInitiator

- must reference `AppModuleInitiator` type from `@equinor/fusion-framework-react-app`
- must show the callback receiving `configurator` and `env` parameters
- must mention `onConfigured` and `onInitialized` hooks
- should reference `cookbooks/app-react/src/config.ts` as canonical example
- should note `env` provides render environment (manifest, basename, etc.)

## How to listen to framework events

- must mention `addEventListener` on the event module
- must mention `dispatchEvent` with `cancelable: true` requires `await`
- must reference `@equinor/fusion-framework-module-event` package
- should show `FrameworkEventMap` declaration merging for custom event types
- should mention `addEventListener` returns a teardown function
- should mention `event$` observable and `filterEvent` operator
- should note events bubble to parent providers by default
