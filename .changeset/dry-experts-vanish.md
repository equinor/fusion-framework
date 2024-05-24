---
'@equinor/fusion-framework-react-components-people-provider': minor
'@equinor/fusion-framework-module-services': minor
---

## @equinor/fusion-framework-module-services

Updated the `PeopleApiClient.photo` method to properly type the response as `PersonPhotoApiResponse<TVersion>` instead of `Blob`. This allows for more accurate type checking when using the method.

To update your code:

-   If you are using the `PeopleApiClient.photo` method directly, no changes are needed. The method will now properly type the response.
-   If you have custom type assertions or checks around the response from `PeopleApiClient.photo`, you may need to update them to handle `PersonPhotoApiResponse<TVersion>` instead of `Blob`.

Example:

```ts
// Before
const photoResponse: Blob = await peopleApiClient.photo(
    'v2', 
    'blob', 
    { azureId: '123' }
);
console.log(typeof photoResponse); // Blob

// After
const photoResponse: PersonPhotoApiResponse<'v2'> = await peopleApiClient.photo(
    'v2', 
    'blob', 
    { azureId: '123' }
);
console.log(typeof photoResponse); // Object - { filename: string, blob: Blob }
```
