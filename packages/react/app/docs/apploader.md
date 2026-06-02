# Apploader

Embed a Fusion child application inside a parent Fusion application using the `Apploader` component or `useApploader` hook.

> [!WARNING]
> **Experimental / Proof of Concept**
>
> The embedded application will likely have issues with routing, context, and other framework features.
> Use this only for embedding simple applications such as **PowerBI** or **PowerApps** viewers.

**Import:**

```ts
import { Apploader, useApploader } from '@equinor/fusion-framework-react-app/apploader';
```

## When to Use

Use apploader when your Fusion app needs to render another Fusion app inline — for example, embedding a PowerBI report viewer inside a dashboard app. For complex child apps that need their own routing or context module, this approach is not suitable.

## Apploader Component

The `Apploader` component is the simplest way to embed a child app. It handles loading and error states automatically and mounts the child app's DOM element into a container `div`.

**Signature:**

```tsx
function Apploader(props: ApploaderProps): ReactElement;

type ApploaderProps = {
  /** The app key identifying the Fusion app to load and mount */
  appKey: string;
};
```

**Example:**

```tsx
import { Apploader } from '@equinor/fusion-framework-react-app/apploader';

const Dashboard = () => {
  return (
    <section>
      <h2>Embedded Report</h2>
      <Apploader appKey="my-powerbi-app" />
    </section>
  );
};
```

The component renders:

- `"Loading {appKey}"` while the child app is being fetched and initialized
- `"Error loading {appKey}. Error: {message}"` if initialization fails
- The child app's DOM tree once loaded

## useApploader Hook

Use the `useApploader` hook when you need custom loading or error UI, or when you want more control over how the child app's DOM element is mounted.

**Signature:**

```ts
function useApploader(params: { appKey: string }): {
  loading: boolean;
  error: Error | undefined;
  appRef: React.RefObject<HTMLDivElement | null>;
};
```

**Parameters:**

- `appKey` — the key of the Fusion app to load and mount

**Returns:**

| Property  | Type                                    | Description                                      |
| --------- | --------------------------------------- | ------------------------------------------------ |
| `loading` | `boolean`                               | `true` while the app is loading                  |
| `error`   | `Error \| undefined`                    | Error object if loading fails, otherwise `undefined` |
| `appRef`  | `React.RefObject<HTMLDivElement \| null>` | Ref to the DOM element where the child app is mounted |

**Example:**

```tsx
import { useApploader } from '@equinor/fusion-framework-react-app/apploader';
import { useEffect, useRef } from 'react';

const CustomAppEmbed = ({ appKey }: { appKey: string }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { loading, error, appRef } = useApploader({ appKey });

  useEffect(() => {
    if (containerRef.current && appRef.current) {
      containerRef.current.appendChild(appRef.current);
    }
  }, [appRef.current]);

  if (loading) return <p>Loading application…</p>;
  if (error) return <p>Failed to load: {error.message}</p>;

  return <div ref={containerRef} />;
};
```

## Limitations

- **Routing:** The child app shares the parent's URL space. Deep-linking and navigation inside the embedded app may conflict with the parent's router.
- **Context:** The child app receives the parent's framework instance but does not get its own isolated context module.
- **Scope:** Best suited for simple, self-contained apps (e.g., PowerBI, PowerApps). Complex apps with their own routing or context configuration are not supported.
