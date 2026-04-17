# Context Routing Strategy Cookbook

Integration test app for verifying context routing strategies end-to-end in the Fusion dev portal. This is **not** a minimal example — it is a comprehensive test bed that exercises all routing modes, strategy switching, cross-app handoff, and diagnostics.

> For a minimal context setup example, see the [Context Cookbook](../app-react-context/).

## Purpose

This cookbook exists to:

- **Verify** that `query`, `path`, and `custom` routing strategies work correctly when loaded by the dev portal's context-navigation module
- **Test** strategy switching at runtime to confirm the portal adapts URL handling when the app's declared strategy changes
- **Test** cross-app context handoff — selecting a context in this app and navigating to another app to verify carry-over
- **Expose** diagnostics (active strategy, init source, URL state, context provider version) so developers can inspect exactly what the framework is doing

## How to use

```bash
pnpm dev --filter @equinor/fusion-framework-cookbook-app-react-context-routing
```

Select a routing strategy via the `?routingStrategy=` query parameter or the toggle buttons in the UI:

| Strategy | URL shape | Behavior |
|---|---|---|
| `query` | `/apps/app-react-context-routing?$contextId=abc-123` | Context id in query param (recommended) |
| `path` | `/apps/app-react-context-routing/abc-123` | Context id as path segment (legacy) |
| `custom` | `/apps/app-react-context-routing/route-a/abc-123` | App-controlled trailing context segment |
| `none` | `/apps/app-react-context-routing/` | No context in URL — manual selection only |

## What it covers

### Routing strategy verification
Each strategy wires different `extractContextIdFromPath`, `generatePathFromContext`, and `resolveInitialContext` hooks in `config.ts`. The diagnostics panel shows which strategy is active and how the initial context was resolved.

### Cross-app handoff
The `CrossAppSection` component provides navigation buttons to sibling cookbook apps. After selecting a context and navigating away, you can verify the portal carries the context over using the active strategy.

### Strategy switching
The `StrategyButtons` component triggers a full page reload with a different `?routingStrategy=` param so you can compare how the portal handles each mode without restarting the dev server.

### Diagnostics display
The `DiagnosticsDisplay` component shows:
- Active routing strategy and init source
- Current URL pathname, search, and hash
- Context provider version from the framework
- Whether the URL currently contains a `$contextId` param

## File structure

| Path | Purpose |
|---|---|
| `src/config.ts` | Strategy-dependent context and navigation module configuration |
| `src/hooks/` | Custom hooks for context navigation, cross-app nav, diagnostics, strategy switching |
| `src/pages/` | Route pages with EDS components for layout, diagnostics, and strategy controls |
| `src/utils/` | URL parsing, context path extraction/generation, strategy resolution |
| `src/routes.ts` | Route definitions for the Fusion router |

## Related

- [`@equinor/fusion-framework-module-context`](../../packages/modules/context/) — context module with routing strategy support
- [`@equinor/fusion-framework-module-context-navigation`](../../packages/modules/context-navigation/) — portal-level context-to-URL synchronization module
