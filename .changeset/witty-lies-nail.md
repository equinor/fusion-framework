---
'@equinor/fusion-framework-module-http': minor
---

**New Feature: Enhanced `requestValidationOperator`**

The `requestValidationOperator` is a utility function that validates incoming requests against a Zod schema. This function has two options: `strict` and `parse`. The `strict` option allows you to enforce strict validation, while the `parse` option enables you to return the parsed request object if it passes validation.

The `requestValidationOperator` is meant to be used as a request operator in the Fusion API framework. It is a higher-order function that takes a Zod schema as an argument and returns a function that validates incoming requests against that schema.

| Option                | Description                                                                                                                      | Usage                                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Strict Validation** | When `strict` is set to `true`, the validation will fail if there are additional properties not defined in the schema.           | If `strict` is set to `false` or omitted, additional properties will be allowed and passed through without causing validation errors. |
| **Parse Option**      | When `parse` is enabled, the function will return the parsed and potentially transformed request object if it passes validation. | If `parse` is not enabled, the function will not return anything even if the request object is valid.                                 |

To use the new `strict` and `parse` options, update your code as follows:

Example usage with strict validation:

```typescript
const operator = requestValidationOperator({ strict: true });

// This will throw an error because of invalid method and extra property.
operator({
    method: 'post',
    body: 'foo',
    extraProperty: 'This should not be here',
});
```

Example usage with parsing enabled:

```typescript
// Example usage with parsing enabled
const operator = requestValidationOperator({ parse: true });

// will return { method: 'GET' }
const parsedRequest = operator({
    method: 'GET',
    extraProperty: 'This should not be here',
});
```

Example usage with both strict validation and parsing enabled:

```typescript
const operator = requestValidationOperator({ strict: true, parse: true });

// will throw an error because of extra property.
const parsedStrictRequest = operator({
    method: 'GET',
    extraProperty: 'This should not be here',
});
```

Example usage with the `HttpClient`:

```typescript
const httpClient = new HttpClient();

// Add the request validation operator to the HttpClient.
httpClient.requestHandler.add('validate-init', requestValidationOperator({ parse: true }));

// will throw an error because of invalid method.
httpClient.get('https://example.com', { method: 'get' });
```
