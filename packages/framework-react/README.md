# Fusion Framework React

> Package for creating React provider for Fusion Framework

use case:

 * Initiatiting framework for hosting, aka portal.
 * consume framework internally in host
 * consume framework in child instance, aka app.

```tsx
import { createFrameworkProvider } from '@equinor/fusion-framework-react';

const Framework = () => {
  /** Create and configure framework */
  const FrameworkProvider = createFrameworkProvider(() => {
    config.http.createClient('some_service', 'https://foo.bar')
  });

  return (
      <Suspense fallback={<span>initializing framework...</span>}>
          <FrameworkProvider>{children}</FrameworkProvider>
      </Suspense>
  );
}

const PortalComponent = () => {
  const framework = useFramework();
  const [foo, setFoo] = useState();

  useEffect(() => {
    const client = framework.http.createClient('some_service');
    client.fetch('/foobar').subscribe(x => setFoo(x.json()));
  }, [framework.http])
}

const Portal = () => {
  return (
    <Framework>
      <PortalComponent />
    <Framework>
  );
}
```