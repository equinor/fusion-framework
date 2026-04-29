## Analytics React Hooks

React hooks for tracking application feature usage through the Fusion analytics module.

These hooks are available from `@equinor/fusion-framework-react-app/analytics`. The analytics module is enabled and configured by the hosting portal, so **apps running inside a Fusion portal can use these hooks immediately without any setup**.

### Why track feature usage?

Understanding how users interact with your application helps you make informed decisions about what to build, improve, or remove. Without usage data, you are guessing which features matter.

Common reasons to add feature tracking:

- **Measure adoption** — find out whether a newly released feature is actually being used, and by how many users across different contexts.
- **Identify unused features** — discover features that can be simplified or removed, reducing maintenance cost and complexity.
- **Understand user workflows** — see which paths users take through your application, revealing unexpected patterns or friction points.
- **Support data-driven prioritisation** — back up roadmap discussions with real usage numbers instead of assumptions.
- **Debug user-reported issues** — correlate analytics events with error reports to understand what the user was doing when something went wrong.

### When to use `useTrackFeature`

Use `useTrackFeature` when you want to record a discrete user action or application milestone from a React component. Typical use cases include:

| Use case | What to track | Example event name |
|----------|---------------|-------------------|
| Button or action clicks | User triggers a specific workflow | `'export-clicked'`, `'filter-applied'` |
| Page or component views | A section of the app is displayed | `'dashboard-loaded'`, `'settings-opened'` |
| Feature gate checks | A feature behind a flag is accessed | `'beta-feature-used'` |
| Form submissions | A user completes a form or wizard step | `'report-submitted'`, `'wizard-step-3'` |
| Error recovery actions | A user retries or dismisses an error | `'retry-clicked'`, `'error-dismissed'` |
| Search and filtering | A user interacts with data exploration tools | `'search-executed'`, `'date-range-changed'` |

> [!TIP]
> You do not need to track every click. Focus on actions that answer a question about user behavior or feature value.

### useTrackFeature

Returns a stable callback for tracking feature usage events. Each event automatically includes the current app key and active context as attributes, so downstream dashboards can group events by application and context without extra work.

**Signature:**

```typescript
function useTrackFeature(): (name: string, data?: AnyValueMap) => void;
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Name of the feature being tracked |
| `data` | `AnyValueMap` (optional) | Additional key-value pairs to include with the event |

#### Track a button click

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

#### Track with additional data

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

#### Track on component mount

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

#### Combine click and mount tracking

```tsx
import { useCallback, useEffect } from 'react';
import { useTrackFeature } from '@equinor/fusion-framework-react-app/analytics';

const SomeComponent = () => {
  const trackFeature = useTrackFeature();

  useEffect(() => {
    trackFeature('SomeComponent loaded');
    trackFeature('some feature happened', { extra: 'data', foo: 'bar' });
  }, [trackFeature]);

  const handleOnClick = useCallback(() => {
    trackFeature('button-clicked');
  }, [trackFeature]);

  return <button onClick={handleOnClick}>Click me</button>;
};
```

### Prerequisites

The analytics module must be enabled for these hooks to work. **In most cases, no app-level configuration is needed** — the hosting Fusion portal already enables and configures analytics with the appropriate adapters and collectors. Your app inherits this automatically.

If the module is not available (e.g. in a standalone or custom portal setup), `useTrackFeature` logs an exception via the telemetry provider instead of throwing, so your app will not crash.

#### Custom or standalone setups

If you are building a custom portal or running outside the standard Fusion portal, you need to enable the analytics module yourself:

```typescript
import { enableAnalytics } from '@equinor/fusion-framework-module-analytics';
import { ConsoleAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics/adapters';

const configure = (configurator) => {
  enableAnalytics(configurator, (builder) => {
    builder.setAdapter('console', async () => new ConsoleAnalyticsAdapter());
  });
};
```

See the [analytics module documentation](https://equinor.github.io/fusion-framework/modules/analytics/) for adapter and collector setup.
