# Cookbooks

These queries test whether Fusion MCP search surfaces **cookbook examples**
when developers ask practical "how do I…" questions. Cookbooks live under
`cookbooks/` in the monorepo and provide end-to-end working examples for
common Fusion Framework patterns.

When judging results, verify that:
- At least one result references a `cookbooks/*` path or mentions the
  cookbook by name — not just the underlying package README.
- Cookbook results complement package-level docs rather than replacing them;
  both should appear for a well-indexed query.
- The cookbook content returned is relevant to the specific question, not
  a generic "list of all cookbooks".

## How to build a custom module with configurator and provider in Fusion Framework

- must reference `cookbooks/app-react-module` or its content showing the configurator → provider → module registration pattern
- must mention `BaseConfigBuilder` or a custom configurator class as the configuration entry point
- must mention the `Module` type definition with `initialize` returning a provider instance
- should mention async config processing via `onConfigured` or `onInitialized` lifecycle hooks
- should reference `@equinor/fusion-framework-module` as the base package for module authoring

## How to add bookmark state management to a Fusion React app

- must reference `cookbooks/app-react-bookmark` or `cookbooks/app-react-bookmark-advanced` as working examples
- must mention `useCurrentBookmark` hook for reading and writing bookmark payloads
- must mention that bookmarks are tied to the current context
- should mention the ref pattern to avoid stale closures when updating bookmark state
- should mention multi-page bookmark state with router integration from the advanced cookbook

## How to set up feature flags in a Fusion Framework application

- must reference `cookbooks/app-react-feature-flag` or its content
- must mention `enableFeatureFlag` for module registration in the app configurator
- must mention `useFeature` hook for reading flag state in components
- should mention feature definition structure with `key`, `title`, `description`, `value`, and `readonly` fields
- should show conditional rendering based on feature flag values

## How to integrate analytics and telemetry in a Fusion portal

- must reference `cookbooks/portal-analytics` or its content showing the collector and adapter patterns
- must mention at least one collector type such as `ContextSelectedCollector` or `AppSelectedCollector`
- must mention an analytics adapter such as `ConsoleAnalyticsAdapter` or `FusionAnalyticsAdapter`
- should mention OpenTelemetry or OTLP exporter integration for backend telemetry
- should mention manual feature tracking for custom analytics events
