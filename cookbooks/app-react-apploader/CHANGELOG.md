# Change Log

## 0.1.0

### Minor Changes

- [#3039](https://github.com/equinor/fusion-framework/pull/3039) [`bfa2317`](https://github.com/equinor/fusion-framework/commit/bfa2317c1d23bd606fdbc2e9857b0be69b08e720) Thanks [@eikeland](https://github.com/eikeland)! - `@equinor/fusion-framework-react-app/fusion-apploader`

  [FusionApploader](#fusionapploader) component and [useFusionApploader](#usefusionapploader) is intended to be used to embed Fusion applications inside other Fusion application.

  > [!WARNING] > `FusionApploader` is an experimental poc.
  >
  > The embedded application will likely have issues with routing, context and other framework functionality, so use with care.
  >
  > Should only be used to embed 'simple' applications like **PowerBI** and **PowerApps**.

  ## FusionApploader

  React component for embeding a Fusion child application inside a parent Fusion application.

  Handles loading and error states, and mounts the child app's DOM element into a container div.

  If you need to customise the error and loading messages, then use the hook `useFusionApploader` and create your own component.

  ### Example usage

  ```typescript
  <FusionApploader appKey="my-app" />
  ```

  ## useFusionApploader

  A React hook for dynamically loading and mounting a Fusion child app inside a parent Fusion app. Handles loading state, error reporting, and provides a reference to the mounted app’s DOM element.

  ### Signature

  ```typescript
  useFusionApploader({ appKey }: { appKey: string }): {
    loading: boolean;
    error: Error | undefined;
    appRef: React.RefObject<HTMLDivElement | null>;
  }
  ```

  ### Parameters

  `appKey (string)`: The key of the Fusion app to load and mount.

  ### Returns

  - **loading** `(boolean)`: true while the app is loading.
  - **error** `(Error | undefined)`: Error object if loading fails, otherwise undefined.
  - **appRef** `(React.RefObject<HTMLDivElement | null>)`: Ref to the DOM element where the child app is mounted.

  ### Usage Example

  ```typescript
  import React, { useEffect, useRef } from "react";
  import { useFusionApploader } from "./useFusionAppLoader";

  const MyAppLoader = ({ appKey }: { appKey: string }) => {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const { loading, error, appRef } = useFusionApploader({ appKey });

    useEffect(() => {
      if (wrapperRef.current && appRef.current) {
        wrapperRef.current.appendChild(appRef.current);
      }
    }, [appRef.current]);

    if (loading) return <div>Loading {appKey}...</div>;
    if (error)
      return (
        <div>
          Error loading {appKey}: {error.message}
        </div>
      );

    return <div ref={wrapperRef} />;
  };
  ```

  ### Notes

  - The hook is designed to be used in a parent Fusion app context.
  - The returned appRef should be appended to a container element in your component.
  - Handles subscription and cleanup automatically.
  - Useful for micro-frontend scenarios where apps are loaded dynamically.
