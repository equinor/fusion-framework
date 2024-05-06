---
title: Navigation
category: Module
tag:
  - navigation
  - routing
  - react-router
---

Simple module which allows to monitor navigation events

> [!CAUTION]
> using `createBrowserRouter` from `React Router` will cause unpredictable links and history behavior,
> since it will create its own wrapper on browser history which is __NOT__ connected to the framework

## Configuration

### Options

#### basename

The module needs to now the base path for routing and creating links.

> basename is optional but should __ONLY__ skipped if used as stand alone application or portal

#### historyType

- `browser` - uses relative paths
- `hash` - use url hash
- `memory` - use memory routing (ex. react-native)

> by default this is set to `browser`

#### createHistory

callback function for creating history based on selected `historyType`

## Example

[cookbook -see example](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-router/src)

### config.ts
@[code](@cookbooks/app-react-router/src/config.ts)

### Router.tsx
@[code](@cookbooks/app-react-router/src/Router.tsx)

### Router.tsx
@[code](@cookbooks/app-react-router/src/routes.tsx)