---
'@equinor/fusion-framework-module-http': minor
---

The `HttpClientConfigurator` now has by default the `capitalizeRequestMethodOperator` and `requestValidationOperator` enabled.

**CapitalizeRequestMethodOperator**

This operator will capitalize the HTTP method name before sending the request. This is useful when you are using a client that requires the HTTP method to be capitalized. If you want to disable this operator, you can do so by removing it from the `HttpClientConfigurator`:

```typescript
httpConfig.defaultHttpRequestHandler.remove('capitalize-method');
```

> [!NOTE]
> This operator is enabled by default and will log to the console if the method is not capitalized.

**RequestValidationOperator**

This operator will parse and validate the request before sending it. If the request is invalid, the error will be logged to the console. If you want to disable this operator, you can do so by removing it from the `HttpClientConfigurator`:

```typescript
httpConfig.defaultHttpRequestHandler.remove('validate-request');
```

> [!NOTE]
> This operator is enabled by default and will log to the console if the request parameters are invalid.

If you wish stricter validation, you can enable the `strict` mode by setting the `strict` property to `true`:

```typescript
import { requestValidationOperator } from '@equinor/fusion-framework-module-http/operators';

httpConfig.defaultHttpRequestHandler.set(
  'validate-request'
  requestValidationOperator({
    strict: true, // will throw error if schema is not valid
    parse: true // will not allow additional properties
  })
);
```
