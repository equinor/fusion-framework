---
'@equinor/fusion-framework-module-navigation': major
---

extend base module provider

* make `NavigationProvider` extend `BaseModuleProvider`
* internal function `_localizeLocation` is renamed to `_localizePath`. _should not cause breaking changes_
* expose localized state from `Navigator` _(history)_

BREAKING CHANGE: `NavigationProvider` no longer extends `Observable<{ action: Action; path: Path }>`, use `INavigationProvider.state$` _(this is now a localized path)_