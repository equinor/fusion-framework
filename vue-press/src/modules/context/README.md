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
import { enableContext } from '@equinor/fusion-framework-module-context';
```

@tab react
```ts
import { enableContext } from '@equinor/fusion-framework-react-module-context';
```
:::

```ts
export const configure = (configurator) => enableContext(configurator);
```

### Options

#### setContextType

```ts
export const configure = (configurator) => {
  enableContext(configurator, (builder) => {
    /** optional filter for query types, array of string */
    builder.setContextType(['project']);
  });
}
```

array of context types which queries are filtered by

#### setContextFilter

```ts
export const configure = (configurator) => {
  enableContext(configurator, (builder) => {
    /** optional filter of query result */
    builder.setContextFilter((items) => items.filter(item => item.title.match(/a/)));
  });
}
```

#### setContextParameterFn

Set method which generates the parameters for the query function. see [Query Context](../services/context/#query-context).

::: code-tabs

@tab Standard
```ts
export const configure = (configurator) => {
  enableContext(configurator, (builder) => {
    builder.setContextParameterFn((args) => {
      const { search, type } = args;
      // Modify search and type ??
      return {
          search,
          filter: {
              type,
              externalId: 'foobar36-8890-4b16-b973-9e13b9a72c26'
          }
      };
    } 
  });
}
```

@tab OData
```ts
/** helper method for generating odata */
import buildQuery from 'odata-query';

export const configure = (configurator) => {
  enableContext(configurator, (builder) => {
    builder.setContextParameterFn((args) => {
      const { search, type } = args;
      return buildQuery({
          search,
          filter: {
              type: {
                  in: type,
              },
          },
      });
    } 
  });
}
```
:::

::: info QueryClient
currently `setContextParameterFn` requires an return type of `string | QueryContextParameters`, 
but this method is creating the parameters to the query function. 

If using a custom client with custom parameters, use this method to generate the custom parameters. 

If there is a demand for generic query parameters we will in the future make the return type more generic. 
:::


#### setContextClient

```ts
export const configure = (configurator) => {
  enableContext(configurator, (builder) => {
    /** request another module that is enabled */
    const httpProvider = await builder.requireInstance('http');
    const client = httpProvider.createClient('my-api');

    /** 
     * By default the Framework will resolve the context service
     * @see {@link QueryCtorOptions} for advance configuration of query client
     * @see [ObservableInput - RxJS](https://rxjs.dev/api/index/type-alias/ObservableInput) 
     * @return object for getting and querying context
     */
    return builder.setContextClient({
        get: (args) => client.json$(`/api/context/${args.id}`),
        query: (args) =>
            client.json$(`/api/context/search/`, {
                method: 'post',
                body: JSON.stringify(args),
            }),
    });
  });
}
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