---
'@equinor/fusion-framework-module-http': major
---

The `blob` and `blob$` methods in the `HttpClient` class have been updated to provide a more robust and flexible API for fetching blob resources.

1. The `blob` and `blob$` methods now accept an optional `args` parameter of type `FetchRequestInit<T, TRequest, TResponse>`, where `T` is the type of the expected blob result. This allows consumers to customize the fetch request and response handling.
2. The `blob` and `blob$` methods now return a `Promise<T>` and `StreamResponse<T>` respectively, where `T` is the type of the expected blob result. This allows consumers to handle the blob data in a more type-safe manner.
3. The `blobSelector` function has been updated to extract the filename (if available) from the `content-disposition` header and return it along with the blob data in a `BlobResult` object.

4. If you were previously using the `blob` or `blob$` methods and expecting a `Blob` result, you must now use the new `BlobResult` type, which includes the filename (if available) and the blob data.

> [!WARNING]
> This alters the return type of the `blob` and `blob$` methods, which is a **breaking change**.

Example:

```typescript
const blobResult = await httpClient.blob('/path/to/blob');
console.log(blobResult.filename); // 'example.pdf'
console.log(blobResult.blob); // Blob instance
```

1. If you were providing a custom selector function to the `blob` or `blob$` methods, you can now use the new `BlobResult` type in your selector function.

Example:

```typescript
const customBlobSelector = async (
    response: Response,
): Promise<{ filename: string; blob: Blob }> => {
    // Extract filename and blob from the response
    const { filename, blob } = await blobSelector(response);
    return { filename, blob };
};

const blobResult = await httpClient.blob('/path/to/blob', { selector: customBlobSelector });
console.log(blobResult.filename); // 'example.pdf'
console.log(blobResult.blob); // Blob instance
```

3. If you were using the `blob$` method and expecting a `StreamResponse<Blob>`, you can now use the new `StreamResponse<T>` type, where `T` is the type of the expected blob result.

Example:

```typescript
const blobStream = httpClient.blob$('/path/to/blob');
blobStream.subscribe((blobResult) => {
    console.log(blobResult.filename); // 'example.pdf'
    console.log(blobResult.blob); // Blob instance
});
```
