# Fusion React

## Basic Setup
```tsx
export const setup = (fusion: Fusion) => {
  const services = fusion.createServiceInstance();
  return (element: HTMLElement) => 
      ReactDOM.render(
          element,
          <FusionServiceProvider service={services}>
            <App />
          </FusionServiceProvider>
    );
}
export default setup;
```

## Configure
```tsx
const configure = (config) => {
  config.http.configureClient(
      'bar', 
      'https://somewhere-test.com'
    );
}

export const setup = (fusion: Fusion) => {
  const services = fusion.createServiceInstance(configure);
  return (element: HTMLElement) => 
      ReactDOM.render(
          element,
          <FusionServiceProvider service={services}>
            <App />
          </FusionServiceProvider>
    );
}
export default setup;
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
