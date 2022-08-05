# Fusion React App

Package for developing applications that uses the `@equinor/fusion-framework`.

[API documentation](https://equinor.github.io/fusion-framework/modules/_equinor_fusion_framework_react_app.html)

__Dependencies__

![npm (scoped)](https://img.shields.io/npm/v/@equinor/fusion-framework?label=fusion-framework&style=for-the-badge)

![npm (scoped)](https://img.shields.io/npm/v/@equinor/fusion-framework-module?label=fusion-framework-module&style=for-the-badge)

![npm (scoped)](https://img.shields.io/npm/v/@equinor/fusion-framework-module-http?label=fusion-framework-module-http&style=for-the-badge)

![npm (scoped)](https://img.shields.io/npm/v/@equinor/fusion-framework-module-msal?label=fusion-framework-module-msal&style=for-the-badge)

![npm (scoped)](https://img.shields.io/npm/v/@equinor/fusion-framework-react?label=fusion-framework-react&style=for-the-badge)

![npm (scoped)](https://img.shields.io/npm/v/@equinor/fusion-observable?label=fusion-observable&style=for-the-badge)

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