# Fusion React App

Package for developing applications that uses the `@equinor/fusion-framework`.

[API documentation](https://equinor.github.io/fusion-framework/modules/_equinor_fusion_framework_react_app.html)

__Dependencies__


[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fframework%2Fpackage.json&label=framework&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/framework)

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fmodule%2Fpackage.json&label=module&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/module)

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fmodule-http%2Fpackage.json&label=module-http&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/module-http)

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fmodule-msal%2Fpackage.json&label=module-msal&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/module-msal)

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Freact-module%2Fpackage.json&label=react-module&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/react-module)

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Freact-module-app-config%2Fpackage.json&label=react-module-app-config&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/react-module-app-config)


## Configure
```tsx
// config.ts
import { AppConfigurator } from '@equinor/fusion-framework-react-app';
const configCallback: AppConfigurator = (configurator) => {
 configurator.http.configureClient(
    'bar', {
      baseUri: 'https://somewhere-test.com',
      defaultScopes: ['foo/.default']
    }
  );
};

// App.tsx
export const App = () => {
  const client = useHttpClient('bar');
  const [foo, setFoo] = useState('no value');
  const onClick = useCallback(() => {
    client.fetchAsync('api').then(x => x.json).then(setFoo);
  }, [client]);
  return <Button onClick={onClick}>{foo}</Button>
}

// index.ts
import { createApp } from '@equinor/fusion-framework-react-app';
export const render = createApp(App, configCallback);
export default render;
```

## Hooks

### useModule
```tsx
import { useModule } from '@equinor/fusion-framework-react-app';
const ShowToken = () => {
  const auth = useModule('auth');
  const [token, setToken] = useState<string>('');
  useEffect(() => {
    auth.acquireAccessToken().then(setToken);
  }, [auth]);
  return <span>{token ?? 'fetching token'}</span>
}
```

## Http

### useHttpClient

```tsx
import { useHttpClient } from '@equinor/fusion-framework-react-app/http';
const App = () => {
  const fooClient = useHttpClient('foo');
  
  // using as stream
  useEffect(() => {
    const sub = client.fetch('api/all').subscribe((x) => {
      setFoo(x.json());
    });
    return () => sub.unsubscribe();
  },[fooClient]);

  // using as promise
  const barClient =  useHttpClient('bar');
  useCallback(async() => {
    const res = await portalClient.fetchAsync('api/bar');
    console.log(res.json());
  },[barClient]);
  
}
```

## Feature Flag

> [!IMPORTANT]
> `@equinor/fusion-framework-module-feature-flag` must be installed to make this module available

### Simple
```ts
import { enableFeatureFlag } from '@equinor/fusion-framework-react-app/feature-flag'; 
export const configure: ModuleInitiator = (appConfigurator, args) => {
  /** provide a list of features that should be available in the application */
  enableFeatureFlag(appConfigurator, [
    {
      key: MyFeatures.MyFlag,
      title: 'this is a flag',
    },
    {
      key: MyFeatures.MyUrlFlag,
      title: 'this feature can be toggled by ?my-url-flag=true',
      allowUrl: true,
    }
  ]);
}
```

### Custom
```ts
export const configure: ModuleInitiator = (appConfigurator, args) => {
  appConfigurator.useFeatureFlags(builder => /** see module for building custom config */);
}
```

[see module](../modules/feature-flag/README.md) for more technical information;