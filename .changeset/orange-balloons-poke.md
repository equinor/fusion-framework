---
'@equinor/fusion-framework-module-http': patch
---

- Added a new type `ResponseSelector<TResult, TResponse>`: a function that takes a `Response` object and returns an observable stream of type `TResult`. The `ResponseSelector` type has two template parameters: `TResult` and `TResponse`.
- Updated the `FetchRequestInit` type to include a new property `selector` of type `ResponseSelector<TReturn, TResponse>`, which allows specifying a response selector function.
- Updated the blob-selector and json-selector functions to use the new `ResponseSelector` type.
