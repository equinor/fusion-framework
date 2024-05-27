---
'@equinor/fusion-framework-app': minor
'@equinor/fusion-framework': minor
'@equinor/fusion-framework-react-app': minor
'@equinor/fusion-framework-react': minor
---

If you were previously using the `blob` or `blob$` methods from the `IHttpClient` and expecting a `Blob` result, you must now use the new `BlobResult` type, which includes the filename (if available) and the blob data.

**Migration Guide:**

```typescript
// Before
const blob = await httpClient.blob('/path/to/blob');
console.log(blob); // Blob instance

// After
const blobResult = await httpClient.blob<Blob>('/path/to/blob');
console.log(blobResult.filename); // 'example.pdf'
console.log(blobResult.blob); // Blob instance
```
