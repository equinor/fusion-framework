---
'@equinor/fusion-framework-module-http': patch
---

The `jsonSelector` function was not checking the error type in the `catch` block.
This lead to not throwing the error with parsed data, but always throwing a parser error, where the correct error was `cause` in the `ErrorOptions`

**BREAKING CHANGE:**

If for some reason developers has catched the error and assumed the `cause` property would give the proper error data, this will no longer be the case.

```ts
try {
    await jsonSelector(response);
} catch (error) {
    if (error instanceof HttpJsonResponseError) {
        const { data, cause } = error;
        if (data) {
            console.error('the request was not `ok`, see provided error data', data);
        } else {
            console.error('failed to parse data from response, see provided cause', cause);
        }
    }
}
```

```diff
try {
  await jsonSelector(response);
} catch (error) {
  if(error instanceof HttpJsonResponseError) {
-    const data = error.cause instanceof HttpJsonResponseError ? err.cause.data : null;
+    const data = error instanceof HttpJsonResponseError ? error.data : null;
    if(data) {
      console.error('the request was not `ok`, see provided error data', data);
    } else {
      console.error('failed to parse data from response, see provided cause', error.cause);
    }
  }
}
```
