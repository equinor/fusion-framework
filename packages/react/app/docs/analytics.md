# Analytics

React hooks for tracking application feature usage through the Fusion analytics module.

**Import:**

```ts
import { useTrackFeature } from '@equinor/fusion-framework-react-app/analytics';
```

The analytics module is enabled and configured by the hosting portal, so **apps running inside a Fusion portal can use these hooks immediately without any setup**.

## When to Track

Use `useTrackFeature` when you want to record a discrete user action or application milestone. Focus on actions that answer a question about user behavior or feature value — you do not need to track every click.

| Use case                | What to track                            | Example event name           |
| ----------------------- | ---------------------------------------- | ---------------------------- |
| Button or action clicks | User triggers a specific workflow        | `'export-clicked'`           |
| Page or component views | A section of the app is displayed        | `'dashboard-loaded'`         |
| Feature gate checks     | A feature behind a flag is accessed      | `'beta-feature-used'`        |
| Form submissions        | A user completes a form or wizard step   | `'report-submitted'`         |
| Error recovery actions  | A user retries or dismisses an error     | `'retry-clicked'`            |

## useTrackFeature

Returns a stable callback for tracking feature usage events. Each event automatically includes the current app key and active context as attributes, so downstream dashboards can group events by application and context without extra work.

**Signature:**

```ts
function useTrackFeature(): (name: string, data?: AnyValueMap) => void;
```

| Parameter | Type                       | Description                                  |
| --------- | -------------------------- | -------------------------------------------- |
| `name`    | `string`                   | Name of the feature being tracked            |
| `data`    | `AnyValueMap` _(optional)_ | Additional key-value pairs included with the event |

### Track a Button Click

```tsx
import { useCallback } from 'react';
import { useTrackFeature } from '@equinor/fusion-framework-react-app/analytics';

const MyButton = () => {
  const trackFeature = useTrackFeature();

  const handleClick = useCallback(() => {
    trackFeature('button-clicked');
  }, [trackFeature]);

  return <button onClick={handleClick}>Click me</button>;
};
```

### Track with Additional Data

Pass a second argument to include custom attributes with the event:

```tsx
import { useCallback } from 'react';
import { useTrackFeature } from '@equinor/fusion-framework-react-app/analytics';

const SaveButton = ({ section }: { section: string }) => {
  const trackFeature = useTrackFeature();

  const handleSave = useCallback(() => {
    trackFeature('save-clicked', { section, timestamp: Date.now() });
  }, [trackFeature, section]);

  return <button onClick={handleSave}>Save</button>;
};
```

### Track on Component Mount

Use `useEffect` to track when a component or page loads:

```tsx
import { useEffect } from 'react';
import { useTrackFeature } from '@equinor/fusion-framework-react-app/analytics';

const Dashboard = () => {
  const trackFeature = useTrackFeature();

  useEffect(() => {
    trackFeature('dashboard-loaded');
  }, [trackFeature]);

  return <div>Dashboard content</div>;
};
```

## Prerequisites

The analytics module must be enabled for the hook to work. **In most cases, no app-level configuration is needed** — the hosting Fusion portal already enables and configures analytics. Your app inherits this automatically.

If the module is not available (e.g. in a standalone or custom portal setup), `useTrackFeature` logs an exception via the telemetry provider instead of throwing, so your app will not crash.

### Custom or Standalone Setups

If you are building a custom portal or running outside the standard Fusion portal, enable the analytics module yourself:

```ts
import { enableAnalytics } from '@equinor/fusion-framework-module-analytics';
import { ConsoleAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics/adapters';

const configure = (configurator) => {
  enableAnalytics(configurator, (builder) => {
    builder.setAdapter('console', async () => new ConsoleAnalyticsAdapter());
  });
};
```

See the [analytics module documentation](https://equinor.github.io/fusion-framework/modules/analytics/) for adapter and collector setup.
