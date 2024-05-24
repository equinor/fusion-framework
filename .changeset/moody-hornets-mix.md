---
'@equinor/fusion-framework-cookbook-app-react-people': minor
---

-   Added documentation and examples for using components from the `@equinor/fusion-react-person` package.
-   Implemented a `useSearchPersons` hook to search for persons using the People API.
-   Added a `searchPerson` function to perform person searches with an HTTP client.
-   Created new types for the person search API response and error handling.
-   Updated the `HomePage` component with an overview of working with the People API.
-   Enhanced the `ListItemPage` component to fetch and display a list of persons based on a search query.

The `@equinor/fusion-framework-cookbook-app-react-people` package lacked documentation and examples for consuming the `@equinor/fusion-react-person` components. The changes aim to provide clear guidance and showcase how to interact with the People API to fetch and display person information.

By adding the `useSearchPersons` hook and `searchPerson` function, developers how to implement functionality to their applications. The new types for the API response and error handling improve type safety and provide a structured way to handle different error scenarios.

The updates to the `HomePage` and `ListItemPage` components demonstrate practical usage of the People API and components, making it easier for developers to understand and implement similar functionality in their own applications.
