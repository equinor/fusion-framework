---
"@equinor/fusion-framework-module-navigation": patch
---

Add `ProxyHistory` to prevent shared `BrowserHistory` disposal when child apps tear down.

When a child app inherits the portal's history via `NavigationConfigurator`, the history is now
wrapped in a `ProxyHistory` that delegates all operations but keeps its own listener/blocker
teardown list. Disposing the proxy only cleans up proxy-owned subscriptions — the underlying
history remains intact.

`setHistory()` gains an optional `{ proxy }` flag (default: `true`) to control wrapping behavior.

Fixes: https://github.com/equinor/fusion-core-tasks/issues/1016
