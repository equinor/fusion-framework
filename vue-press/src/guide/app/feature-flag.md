---
title: Feature Flag
category: Guide
tag:
    - how to
    - basic
    - app
    - cookbooks
    - feature
    - feature-flag
---

# Feature flag

This module allows apps to create features that can be toggled on/off.

The framework/portal features as well as app features will be available in the
use `sidesheet` from the top bar.
The portal flags are created and maintained by `Fusion Core team`.

The reason for creating feature flags are multifold. One can for instance use a
feature flag to test some functionality (in prod) or to roll out a feature over
time. Some (beta test) users can toggle on the feature without the functionality
being active for every user.

## Configuration
```ts
// app/src/config.ts

import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import { enableFeatureFlagging } from '@equinor/fusion-framework-module-feature-flag';

export const configure: AppModuleInitiator = (configurator, args) => {
    const { basename } = args.env;
    enableNavigation(configurator, basename);

    enableFeatureFlagging(configurator, (builder) => {
        builder.enableCgi('app-react-feature-flag', [
            {
                key: 'redHeader',
                title: 'Use red header?',
                description: 'When enabled, the header will be colored red',
            },
            'foo',
        ]);
    });
};

export default configure;
```

## Usage

### Check the state of a flag

```ts
import {
    useFeatureFlag,
    useFrameworkFeatureFlag,
} from '@equinor/fusion-framework-react-app/feature-flag';
import FeatureFlag from './FeatureFlag';

const { feature: redHeaderFlag } = useFeatureFlag('redHeader');
const { feature: pinkBgFlag } = useFrameworkFeatureFlag('pinkBg');

console.log(redHeaderFlag?.enabled);
console.log(pinkBgFlag?.enabled);
```

### Change the state of a flag

```tsx
import {
    useFeatureFlag,
    useFeatureFlags,
} from '@equinor/fusion-framework-react-app/feature-flag';

import FeatureFlag from './FeatureFlag';
export const App = () => {
    const { features, setFeatureEnabled } = useFeatureFlags();
    const { feature: fooFlag } = useFeatureFlag('foo');

    return (
        <button onClick={() => setFeatureEnabled('foo', !fooFlag.enabled)}>
            Toggle 'foo' flag
        </button>
    );
};

export default App;
```
