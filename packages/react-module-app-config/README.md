# Fusion Framework React Module App Config

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Freact-module%2Fpackage.json&label=@equinor/fusion-framework-react-module&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/react-module)

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Freact-module-app-config%2Fpackage.json&label=@equinor/fusion-framework-react-module-app-config&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/module-app-config)

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fobservable%2Fpackage.json&label=@equinor/fusion-observable&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/observable)


## Usage

see `useQueryClient` from [@equinor/fusion-observable](https://github.com/equinor/fusion-framework/tree/main/packages/observable)

```tsx
import { useAppConfig } from '@equinor/fusion-framework-react-module-app-config';

const ShowConfig =() => {
  const { isLoading, data: config } = useAppConfig({
    appKey: 'my-app'; 
    tag: 'beta-1' 
  });
  
  if(isLoading) {
    return <p>Loading config...</p>;
  }
  
  return <pre>{JSON.stringify(config, null, 2)}</pre>
}