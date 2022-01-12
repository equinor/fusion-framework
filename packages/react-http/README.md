```tsx
import {useHttpClient} from '@equinor/fusion-framework-react-http';
const App = () => {
  // fusion registered clients should give intellisense.
  const portalClient = useHttpClient('portal');
  portalClient.fetch('api/something');

  const customClient =  useHttpClient('foo');
  portalClient.fetch('api/bar');
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