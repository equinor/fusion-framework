## Feature Flag Module

[SemVer](https://www.npmjs.com/package/semver)



## Configuration

### Plugins

#### CGI
Plugin for enable/disable features by url search parameters 
```ts
import {enableCgiPlugin} from '@equinor/fusion-framework-module-feature-flag/plugins';
// ...configuration
enableFeatureFlagging(builder => {
  /** simple */
  builder.addPlugin(['foo', 'foobar']);
  /** advance */
  builder.addPlugin(
    [
      {
        name: 'foo',
        enabled: true,
      },
      {
        name: 'foo',
        version: '1.2.3',
        enabled: false,
      }
    ], 
    { 
      /** restrict to only allow accessing feature flags provided */
      onlyProvided: true ,
      /** custom assertion of features */
      isFeatureEnabled: ({feature, value, path}) => {
        if(path.pathname.includes("foobar")){
          return false;
        }
        if(feature.satisfies('^1.1.2') && currentUser.type === 'admin'){
          return value === "1";
        }
        if(feature.name === 'foo'){
          return value === 'blue-steel';
        }
        return value !== "0";
      }
    }
  );
})
```

#### Session
Plugin for storing feature flags state to local storage

```ts
import {enableSessionPlugin} from '@equinor/fusion-framework-module-feature-flag/plugins';
// ...configuration
enableFeatureFlagging(builder => {
  /** name/key required for unique cache key for each consumer */
  build.addPlugin(enableSessionPlugin("my-app"))
})
```

### Usage

use supplementary library if unfamiliar with `rxjs`

see [@equinor/fusion-observable](https://www.npmjs.com/package/@equinor/fusion-observable)

> __TBA:__ @equinor/fusion-framework-react-module-feature-flag

```ts
// my-code.ts
const provider = modules.featureFlag;

/* [{name: 'foo'}, {name: 'foo', version: '1.2.3'}] */
provider.getFeatures('foo');

/* [{name: 'foo', version: '1.2.3'}] */
provider.getFeatures('foo', { range: '^1.2.0' });

/* [{name: 'foo', version: '1.2.3'}] */
provider.getFeatures('foo@1.2.3');

/* [{name: 'foo', version: '1.2.3'}] */
provider.getFeatures((feature) => feature.name === 'foo' && feature.satisfies('^1.2.0'));
```
