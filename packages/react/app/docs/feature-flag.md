# Feature Flag

Add, read, and toggle feature flags in your Fusion app.

**Import:**

```ts
import { enableFeatureFlag, useFeature } from '@equinor/fusion-framework-react-app/feature-flag';
```

## Overview

Feature flags let you ship code behind a toggle — enabling gradual rollouts, A/B testing, or developer-only features. The `enableFeatureFlag` helper registers flags in your app's configurator, and the `useFeature` hook reads and toggles them at runtime. Framework-level flags are also visible through this hook.

## Configure Feature Flags

Register flags in your app's configuration callback. Each flag has a `key`, a `title`, and optionally `allowUrl` to enable URL-driven overrides (e.g. `?my-flag=true`):

```ts
import { enableFeatureFlag } from '@equinor/fusion-framework-react-app/feature-flag';

export const configure = (configurator) => {
  enableFeatureFlag(configurator, [
    {
      key: 'dark-mode',
      title: 'Dark Mode',
      enabled: false,
    },
    {
      key: 'beta-dashboard',
      title: 'Beta Dashboard',
      enabled: false,
      allowUrl: true, // can be toggled via URL query parameter
    },
  ]);
};
```

## useFeature

Reads a single feature flag by key and provides a toggle callback. Merges feature flags from both the framework scope and the application scope, so framework-level flags are visible alongside app-specific ones.

**Signature:**

```ts
function useFeature<T = unknown>(key: string): {
  feature?: IFeatureFlag<T>;
  toggleFeature: (enabled?: boolean) => void;
  error?: unknown;
};
```

**Returns:**

| Property        | Type                        | Description                                           |
| --------------- | --------------------------- | ----------------------------------------------------- |
| `feature`       | `IFeatureFlag<T> \| undefined` | The resolved feature flag, or `undefined` if not found |
| `toggleFeature` | `(enabled?: boolean) => void`  | Toggle the flag; pass `true`/`false` to set explicitly, or omit to invert |
| `error`         | `unknown`                   | Any error from the feature-flag observable             |

### End-to-End Example

```tsx
import { useFeature } from '@equinor/fusion-framework-react-app/feature-flag';

const Dashboard = () => {
  const { feature, toggleFeature } = useFeature('beta-dashboard');

  return (
    <div>
      <button onClick={() => toggleFeature()}>
        {feature?.enabled ? 'Disable' : 'Enable'} beta dashboard
      </button>
      {feature?.enabled && <BetaDashboard />}
    </div>
  );
};
```

### Read-Only Flag Check

```tsx
import { useFeature } from '@equinor/fusion-framework-react-app/feature-flag';

const FeatureGate = ({ flagKey, children }: { flagKey: string; children: React.ReactNode }) => {
  const { feature } = useFeature(flagKey);
  if (!feature?.enabled) return null;
  return <>{children}</>;
};
```

## Advanced Configuration

For advanced scenarios, pass a builder callback instead of an array:

```ts
import { enableFeatureFlag } from '@equinor/fusion-framework-react-app/feature-flag';

export const configure = (configurator) => {
  enableFeatureFlag(configurator, (builder) => {
    builder.addFeatures([{ key: 'dark-mode', title: 'Dark Mode', enabled: false }]);
    builder.addPlugin(myCustomPlugin);
  });
};
```

## Notes

- Framework-level flags are merged with app-level flags — if both define the same key, the app-level flag takes precedence
- Feature flags persist to local storage by default
- With `allowUrl: true`, flags can be overridden via URL query parameters
