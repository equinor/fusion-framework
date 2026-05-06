# Context Routing — Scenario Diagrams

All possible flows for each routing strategy (`path`, `query`, `custom`).

---

## Path Strategy (`/apps/:appKey/:contextId/...`)

Context id is embedded as a URL path segment.

---

### 1. No Context (Initializing)

The app just loaded and context hasn't resolved yet. The module does nothing and waits.

```mermaid
sequenceDiagram
    participant Source as Source Observable
    participant Provider as ContextNavigationProvider
    participant Adapter as PathStrategyAdapter

    Source->>Provider: emit { context: undefined }
    Provider->>Provider: resolveRoutingExecutionMode → "path"
    Provider->>Adapter: onNonContext()
    Adapter-->>Provider: undefined (do nothing)
    Provider->>Provider: Skip navigation
```

---

### 2. Clear Context

User explicitly clears context. The path segment is removed from the URL.

```mermaid
sequenceDiagram
    participant Source as Source Observable
    participant Provider as ContextNavigationProvider
    participant Adapter as PathStrategyAdapter
    participant Portal as Portal Navigation

    Source->>Provider: emit { context: null }
    Provider->>Provider: resolveRoutingExecutionMode → "path"
    Provider->>Adapter: onClearContext()
    Adapter->>Adapter: Build URL "/apps/{appKey}/"
    Adapter-->>Provider: URL without context segment
    Provider->>Portal: navigate(url, { replace: true })
    Note over Portal: URL: /apps/my-app/
```

---

### 3. App-Handled Context

App has its own navigation module. The app's pathname is used to generate the new URL with context injected.

```mermaid
sequenceDiagram
    participant Source as Source Observable
    participant Provider as ContextNavigationProvider
    participant Adapter as PathStrategyAdapter
    participant AppNav as App Navigation
    participant Portal as Portal Navigation

    Source->>Provider: emit { context: ContextItem }
    Provider->>Provider: resolveRoutingExecutionMode → "path"
    Provider->>Adapter: appContextHandler({ currentContext, appNavigation })
    Adapter->>Adapter: generatePathname(appNav.pathname, context)
    Adapter-->>Provider: URL "/apps/my-app/{contextId}/sub-route"
    Provider->>AppNav: createURL({ pathname })
    Provider->>Portal: navigate(url, { replace: true })
    Note over Portal: URL: /apps/my-app/abc-123/sub-route
```

---

### 4. Portal-Handled Context

No app navigation module available. Portal builds the URL using its own pathname.

```mermaid
sequenceDiagram
    participant Source as Source Observable
    participant Provider as ContextNavigationProvider
    participant Adapter as PathStrategyAdapter
    participant Portal as Portal Navigation

    Source->>Provider: emit { context: ContextItem }
    Provider->>Provider: resolveRoutingExecutionMode → "path"
    Provider->>Adapter: appContextHandler() → undefined (no appNav)
    Provider->>Adapter: portalContextHandler({ currentContext, portalNavigation })
    Adapter->>Adapter: generatePathname(portalNav.pathname, context)
    Adapter-->>Provider: URL "/apps/my-app/{contextId}/"
    Provider->>Portal: navigate(url, { replace: true })
    Note over Portal: URL: /apps/my-app/abc-123/
```

---

### 5. Context Carryover (App Switch)

User navigates from App A to App B. The URL guard detects the active context is missing from the new URL and re-applies it.

```mermaid
sequenceDiagram
    participant User as User
    participant Portal as Portal Navigation
    participant Guard as Context URL Guard
    participant Adapter as PathStrategyAdapter

    User->>Portal: Navigate to /apps/app-b/some-page
    Portal->>Guard: URL changed (state$ emission)
    Guard->>Guard: App loaded, mode = "path"
    Guard->>Guard: Active context exists? Yes (abc-123)
    Guard->>Guard: Context in URL? No
    Guard->>Adapter: Generate corrected URL
    Adapter-->>Guard: URL "/apps/app-b/abc-123/some-page"
    Guard->>Portal: navigate(url, { replace: true })
    Note over Portal: URL: /apps/app-b/abc-123/some-page
```

---

### 6. URL Guard — Context Already Present

URL already contains the correct context. Guard does nothing.

```mermaid
sequenceDiagram
    participant Portal as Portal Navigation
    participant Guard as Context URL Guard

    Portal->>Guard: URL changed → /apps/my-app/abc-123/page
    Guard->>Guard: Active context = abc-123
    Guard->>Guard: Context in URL? Yes
    Guard->>Guard: No action needed — skip
```

---

## Query Strategy (`?$contextId=...`)

Context id is stored as a URL query parameter.

---

### 1. No Context (Initializing)

Same as path — the module waits for context to resolve.

```mermaid
sequenceDiagram
    participant Source as Source Observable
    participant Provider as ContextNavigationProvider
    participant Adapter as QueryStrategyAdapter

    Source->>Provider: emit { context: undefined }
    Provider->>Provider: resolveRoutingExecutionMode → "query"
    Provider->>Adapter: onNonContext()
    Adapter-->>Provider: undefined (do nothing)
    Provider->>Provider: Skip navigation
```

---

### 2. Clear Context

User clears context. The `$contextId` query param is removed.

```mermaid
sequenceDiagram
    participant Source as Source Observable
    participant Provider as ContextNavigationProvider
    participant Adapter as QueryStrategyAdapter
    participant Portal as Portal Navigation

    Source->>Provider: emit { context: null }
    Provider->>Provider: resolveRoutingExecutionMode → "query"
    Provider->>Adapter: onClearContext()
    Adapter->>Adapter: Remove $contextId from search params
    Adapter-->>Provider: URL with param deleted
    Provider->>Portal: navigate(url, { replace: true })
    Note over Portal: URL: /apps/my-app/page (no query param)
```

---

### 3. App-Handled Context

Query strategy has no `appContextHandler` — it skips straight to the portal handler.

```mermaid
sequenceDiagram
    participant Source as Source Observable
    participant Provider as ContextNavigationProvider
    participant Adapter as QueryStrategyAdapter

    Source->>Provider: emit { context: ContextItem }
    Provider->>Provider: resolveRoutingExecutionMode → "query"
    Provider->>Provider: No appContextHandler on adapter
    Note over Provider: Falls through to portalContextHandler
```

---

### 4. Portal-Handled Context

Portal sets the `$contextId` query parameter on the current URL.

```mermaid
sequenceDiagram
    participant Source as Source Observable
    participant Provider as ContextNavigationProvider
    participant Adapter as QueryStrategyAdapter
    participant Portal as Portal Navigation

    Source->>Provider: emit { context: ContextItem }
    Provider->>Provider: resolveRoutingExecutionMode → "query"
    Provider->>Adapter: portalContextHandler({ currentContext, portalNavigation })
    Adapter->>Adapter: Set $contextId=abc-123 on URL search params
    Adapter-->>Provider: URL with updated query
    Provider->>Portal: navigate(url, { replace: true })
    Note over Portal: URL: /apps/my-app/page?$contextId=abc-123
```

---

### 5. Context Carryover (App Switch)

User switches apps. The URL guard detects the missing `$contextId` and re-applies it.

```mermaid
sequenceDiagram
    participant User as User
    participant Portal as Portal Navigation
    participant Guard as Context URL Guard
    participant Adapter as QueryStrategyAdapter

    User->>Portal: Navigate to /apps/app-b/page
    Portal->>Guard: URL changed (state$ emission)
    Guard->>Guard: App loaded, mode = "query"
    Guard->>Guard: Active context exists? Yes (abc-123)
    Guard->>Guard: $contextId in URL? No
    Guard->>Adapter: Generate corrected URL
    Adapter-->>Guard: URL "/apps/app-b/page?$contextId=abc-123"
    Guard->>Portal: navigate(url, { replace: true })
    Note over Portal: URL: /apps/app-b/page?$contextId=abc-123
```

---

### 6. Clear Context with Legacy App Router

App router version < 7. Portal also resets the app's internal route.

```mermaid
sequenceDiagram
    participant Source as Source Observable
    participant Provider as ContextNavigationProvider
    participant Adapter as QueryStrategyAdapter
    participant AppNav as App Navigation (v < 7)
    participant Portal as Portal Navigation

    Source->>Provider: emit { context: null }
    Provider->>Adapter: onClearContext()
    Adapter->>Adapter: Detect appNavigation.version < 7
    Adapter->>AppNav: replace("/")
    Adapter->>Adapter: Remove $contextId from search params
    Adapter-->>Provider: URL without query param
    Provider->>Portal: navigate(url, { replace: true })
    Note over Portal: App internal route also reset to "/"
```

---

## Custom Strategy (App-Defined Routing)

App provides its own `generatePathFromContext` and `extractContextIdFromPath` functions.

---

### 1. No Context (Initializing)

Same behavior — module waits.

```mermaid
sequenceDiagram
    participant Source as Source Observable
    participant Provider as ContextNavigationProvider
    participant Adapter as CustomAdapter

    Source->>Provider: emit { context: undefined }
    Provider->>Provider: resolveRoutingExecutionMode → "custom"
    Provider->>Adapter: onNonContext()
    Adapter-->>Provider: undefined (do nothing)
    Provider->>Provider: Skip navigation
```

---

### 2. Clear Context

Context cleared. Navigate to the app's root URL.

```mermaid
sequenceDiagram
    participant Source as Source Observable
    participant Provider as ContextNavigationProvider
    participant Adapter as CustomAdapter
    participant Portal as Portal Navigation

    Source->>Provider: emit { context: null }
    Provider->>Provider: resolveRoutingExecutionMode → "custom"
    Provider->>Adapter: onClearContext()
    Adapter->>Adapter: Build URL "/apps/{appKey}/"
    Adapter-->>Provider: URL at app root
    Provider->>Portal: navigate(url, { replace: true })
    Note over Portal: URL: /apps/my-app/
```

---

### 3. App-Handled Context

App provides `extractContextIdFromPath`. The adapter uses it with `generatePathname` to build the URL.

```mermaid
sequenceDiagram
    participant Source as Source Observable
    participant Provider as ContextNavigationProvider
    participant Adapter as CustomAdapter
    participant AppCtx as App Context Provider
    participant AppNav as App Navigation
    participant Portal as Portal Navigation

    Source->>Provider: emit { context: ContextItem }
    Provider->>Provider: resolveRoutingExecutionMode → "custom"
    Provider->>Adapter: appContextHandler({ currentContext, contextProvider, appNavigation })
    Adapter->>AppCtx: extractContextIdFromPath(appNav.pathname)
    Adapter->>Adapter: generatePathname(pathname, context, provider, existingId)
    Adapter-->>Provider: URL with custom context path
    Provider->>AppNav: createURL({ pathname })
    Provider->>Portal: navigate(url, { replace: true })
    Note over Portal: URL: /apps/my-app/project/abc-123/details
```

---

### 4. Portal-Handled Context (Fallback)

App lacks navigation module or `extractContextIdFromPath` — custom falls back but has no `portalContextHandler`.

```mermaid
sequenceDiagram
    participant Source as Source Observable
    participant Provider as ContextNavigationProvider
    participant Adapter as CustomAdapter

    Source->>Provider: emit { context: ContextItem }
    Provider->>Provider: resolveRoutingExecutionMode → "custom"
    Provider->>Adapter: appContextHandler() → undefined (missing deps)
    Provider->>Provider: No portalContextHandler on custom adapter
    Provider->>Provider: Emission unhandled — skip navigation
    Note over Provider: Logged: "No handlers for context emission"
```

---

### 5. Context Carryover (App Switch)

URL guard re-applies context using the app's custom extraction logic.

```mermaid
sequenceDiagram
    participant User as User
    participant Portal as Portal Navigation
    participant Guard as Context URL Guard
    participant AppCtx as App Context Provider

    User->>Portal: Navigate to /apps/app-b/dashboard
    Portal->>Guard: URL changed (state$ emission)
    Guard->>Guard: App loaded, mode = "custom"
    Guard->>AppCtx: extractContextIdFromPath("/apps/app-b/dashboard")
    AppCtx-->>Guard: null (no context in URL)
    Guard->>Guard: Active context exists? Yes
    Guard->>AppCtx: generatePathFromContext(context)
    AppCtx-->>Guard: "/apps/app-b/project/abc-123/dashboard"
    Guard->>Portal: navigate(url, { replace: true })
    Note over Portal: URL: /apps/app-b/project/abc-123/dashboard
```

---

### 6. Custom Strategy Fallback to Path

App declares `routingStrategy: 'custom'` but doesn't provide `generatePathFromContext` / `extractContextIdFromPath`. Orchestrator falls back to `path` mode.

```mermaid
sequenceDiagram
    participant Source as Source Observable
    participant Provider as ContextNavigationProvider
    participant Orchestrator as Mode Orchestrator

    Source->>Provider: emit { context: ContextItem }
    Provider->>Orchestrator: resolveRoutingExecutionMode({ strategy: "custom", hasGenerators: false })
    Orchestrator-->>Provider: "path" (fallback)
    Provider->>Provider: Use PathStrategyAdapter instead
    Note over Provider: Behaves identically to Path Strategy from here
```

---

## Summary Table

| Scenario | Path | Query | Custom |
|----------|------|-------|--------|
| No context (undefined) | Skip | Skip | Skip |
| Clear context (null) | Remove path segment | Remove `$contextId` param | Navigate to app root |
| App-handled context | Inject in path via appNav | N/A (no handler) | App's custom extraction |
| Portal-handled context | Inject in path via portalNav | Set `$contextId` param | N/A (no handler) |
| Carryover (app switch) | URL guard re-injects segment | URL guard re-adds param | URL guard uses app generators |
| Missing generators | N/A | N/A | Falls back to path strategy |
