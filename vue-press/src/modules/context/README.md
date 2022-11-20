---
title: Context Module
category: Module
tag: 
  - context
---

<ModuleBadge module="module-context" />

## Configuration

::: code-tabs

@tab poj
```ts
import { enableNavigation } from '@equinor/fusion-framework-module-context';
```

@tab react
```ts
import { enableNavigation } from '@equinor/fusion-framework-react-module-context';
```
:::

```ts
export const configure = (configurator) => {
  enableContext(configurator, {
    /** optional filter for query types */
    contextType: ['project'],
    /** optional filter of query result */
    contextFilter: (items) => items.filter(item => item.title.match(/a/)) 
  });
}
```

### Options

#### contextType

```ts
type contextType = Array<string>
```

array of context types which queries are filtered by

#### contextFilter

```ts
type contextFilter = (items: Array<ContextItem>) => Array<ContextItem>
```

query post request processor, called after query is executed 


## React

<ModuleBadge module="react-module-context" />


### Example

> [cookbook -see example](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-context/src)

#### config.ts
@[code](@cookbooks/app-react-context/src/config.ts)

#### App.tsx
@[code](@cookbooks/app-react-context/src/App.tsx)