# Fusion React

## Basic Setup
```tsx
import { registerReactApp } from '@equinor/fusion-react';

const MyApp = () => <p>Hello Fusion</p>;

export const setup = registerReactApp(MyApp);

export default setup;
```

## Configure
```tsx
// config.ts
export const config = (build) => {
  build.http.configureClient(
      'bar', 
      'https://somewhere-test.com'
    );
}

// index.ts
export const setup = registerReactApp(MyApp, config);
```

## Api Client

```tsx
import {useHttpClient} from '@equinor/fusion-react';
const App = () => {
  // fusion registered clients should give intellisense.
  const portalClient = useHttpClient('portal');
  portalClient.fetch('api/something');

  const customClient =  useHttpClient('foo');
  portalClient.fetch('api/bar');
}
```

### Configure
```tsx
const configure = (config) => {
  config.http.configureClient(
      'bar', 
      'https://somewhere-test.com'
    );
}
```

> Declare custom client for intellisense
>```ts  
> class MyClient extends HttpClient {}
>
> declare module '@equinor/fusion-react' {
>   export interface CustomHttpClients {
>     foo: HttpClient,
>     bar: MyClient;
>   }
> }  
> ```
