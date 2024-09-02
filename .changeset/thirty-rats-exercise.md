---
'@equinor/fusion-framework-react': minor
---

These changes ensure that the `Framework` component and `createFrameworkProvider` function are consistent with the updated configuration approach and support module instances from the parent context.

**Updated Framework Component:**

-   Added `useModules` hook to import modules from the parent context.
-   Updated the `createFrameworkProvider` function to accept a `ref` parameter for module instances.

**Updated create-framework-provider Function:**

-   Added `ref` parameter to the `createFrameworkProvider` function to support module instances.
-   Updated the example usage in the documentation to reflect the changes.

**Misc:**

-   Replaced deprecated import of `FusionConfigurator` with `FrameworkConfigurator` (renaming).
