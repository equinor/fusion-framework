# Feature Flag Cookbook

This cookbook demonstrates how to use feature flags in your Fusion Framework application.

## What This Shows

This cookbook illustrates how to:
- Define feature flags in an enum
- Configure features with different properties
- Use the `useFeature` hook to access features
- Toggle features on/off
- Use feature values for dynamic behavior
- Handle readonly features

## Code Example

### Define Features

```typescript
// src/static.ts
export enum Feature {
  Basic = 'basic',
  ReadOnly = 'read_only',
  WithDescription = 'with_description',
  WithValue = 'with_value',
}
```

### Configure Features

```typescript
import { enableFeatureFlag } from '@equinor/fusion-framework-react-app/feature-flag';
import { Feature } from './static';

export const configure: AppModuleInitiator = (appConfigurator) => {
  enableFeatureFlag(appConfigurator, [
    {
      key: Feature.Basic,
      title: 'Basic',
    },
    {
      key: Feature.WithDescription,
      title: 'With description',
      description: 'Feature with descriptive text',
    },
    {
      key: Feature.ReadOnly,
      title: 'Read only feature',
      description: 'Users cannot toggle this',
      readonly: true,
    },
    {
      key: Feature.WithValue,
      title: 'Feature with value',
      get description() {
        return `When enabled, the header will be colored ${this.value}`;
      },
      value: '#392',
    },
  ]);
};
```

### Use Features

```typescript
import { useFeature } from '@equinor/fusion-framework-react-app/feature-flag';
import { Feature } from './static';

export const FeatureFlags = () => {
  const basicFeature = useFeature(Feature.Basic);
  const descriptionFeature = useFeature(Feature.WithDescription);
  const disabledFeature = useFeature(Feature.ReadOnly);
  const valueFeature = useFeature<string>(Feature.WithValue);

  return (
    <div>
      {descriptionFeature.feature && (
        <div>
          <h3>{descriptionFeature.feature.title ?? descriptionFeature.feature.key}</h3>
          <p>{descriptionFeature.feature.description}</p>
          <Switch
            checked={descriptionFeature.feature.enabled}
            disabled={descriptionFeature.feature.readonly}
            onChange={() => descriptionFeature.toggleFeature()}
          />
        </div>
      )}
      
      {/* Use feature value */}
      <h1 style={{ color: valueFeature.feature?.enabled ? valueFeature.feature.value : undefined }}>
        Feature Flags
      </h1>
    </div>
  );
};
```

## Feature Properties

- `key`: Unique identifier (use enum)
- `title`: Display name
- `description`: Optional description text
- `readonly`: Prevents users from toggling
- `value`: Associated value (string, number, etc.)

## When to Use Feature Flags

Use feature flags for:
- A/B testing
- Gradual feature rollouts
- Remote feature toggling
- Configuration-driven behavior