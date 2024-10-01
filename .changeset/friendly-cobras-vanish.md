---
'@equinor/fusion-framework-module-http': minor
---

Added a new operator `capitalizeRequestMethodOperator` to ensure that the HTTP method of a given request is in uppercase.

-   Introduced `capitalizeRequestMethodOperator` which processes an HTTP request object and converts its method to uppercase.
-   Logs a warning if the HTTP method was converted, providing information about the change and a reference to RFC 7231 Section 4.1.

**Example usage:**

```typescript
import { capitalizeRequestMethodOperator } from '@equinor/fusion-query';

const operator = capitalizeRequestMethodOperator();
const request = { method: 'get' };
const updatedRequest = operator(request);
console.log(updatedRequest.method); // Outputs: 'GET'
```

Adding the operator to the `HttpClient`:

```typescript
const httpClient = new HttpClient();
httpClient.requestHandler.add(
  'capatalize-method', 
  capitalizeRequestMethodOperator()
);

// transforms `method` to uppercase and logs a warning.
httpClient.get('https://example.com', { method: 'get' });
```
