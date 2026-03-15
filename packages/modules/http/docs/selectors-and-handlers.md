# Selectors And Handlers

Selectors and handlers are related, but they solve different problems.

- selectors transform a `Response` into the value your application consumes
- request handlers shape or validate the outgoing request
- response handlers apply transport-level response rules before selector parsing runs

Use this split to keep parsing logic separate from transport policy.

## Choose The Right Tool

| Need | Use |
| --- | --- |
| Parse JSON, blobs, or SSE events | selector |
| Add headers, normalize methods, validate request shape | request handler |
| Reject certain responses before parsing | response handler |
| Reuse parsing rules across multiple calls | selector |
| Reuse transport behavior across a client configuration | handler |

## Built-In Selectors

| Selector | What it returns | Notes |
| --- | --- | --- |
| `jsonSelector` | parsed JSON or `undefined` for `204` | Throws `HttpJsonResponseError` on non-OK responses and includes parsed error payloads when possible |
| `blobSelector` | `{ filename?, blob }` | Extracts `filename` from the `content-disposition` header when present |
| `createSseSelector` | `Observable<ServerSentEvent<T>>` | Lower-level SSE selector used by `client.sse$()` |

## Custom Selector Example

```typescript
import {
  jsonSelector,
  type ResponseSelector,
} from '@equinor/fusion-framework-module-http/selectors';

type User = {
  id: string;
  name: string;
};

const userSelector: ResponseSelector<User> = async (response) => {
  const data = await jsonSelector<User>(response);
  return {
    ...data,
    name: data.name.trim(),
  };
};
```

That selector can then be passed to `client.fetch('/users/42', { selector: userSelector })`.

## Request And Response Handlers

Handlers are sequential operator pipelines attached to each client instance.

- `add(key, operator)` throws if the key already exists
- `set(key, operator)` adds or replaces an operator
- `remove(key)` removes an operator
- returning `void` keeps the previous value flowing through the pipeline
- operators run in insertion order

The public handler types and utilities are exported from `@equinor/fusion-framework-module-http/operators`.

## Default Request Pipeline

Each created client starts with a default request pipeline containing:

1. `capitalizeRequestMethodOperator()`
2. `requestValidationOperator()`

That means lowercase methods are normalized to uppercase and request options are validated in non-throwing mode by default.

## Built-In Request Operators

- `capitalizeRequestMethodOperator(options?)` uppercases `request.method` and can suppress warnings with `silent: true`
- `requestValidationOperator(options?)` validates the request against the package schema and can optionally return parsed values

## Example: Configure Both Parsing And Transport

```typescript
import {
  capitalizeRequestMethodOperator,
  requestValidationOperator,
} from '@equinor/fusion-framework-module-http/operators';

configurator.configureHttpClient('catalog', {
  baseUri: '/api/catalog',
  onCreate: (client) => {
    client.requestHandler.set('validate-strict', requestValidationOperator({
      parse: true,
      strict: true,
    }));

    client.requestHandler.add('normalize-method', capitalizeRequestMethodOperator());

    client.responseHandler.add('reject-server-errors', (response) => {
      if (response.status >= 500) {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    });
  },
});
```

## Rule Of Thumb

- use handlers for cross-cutting transport concerns such as headers, validation, logging, token behavior, or rejecting bad responses
- use selectors for parsing a response into a domain shape
- use observables for orchestration and composition

When a piece of logic changes how the request travels, it usually belongs in a handler. When it changes what value the caller receives, it usually belongs in a selector.