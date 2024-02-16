---
'@equinor/fusion-framework-cli': major
---
Expanding the Fusion CLI introduces the capability to create widgets, enhancing development server configuration via `dev.config.ts`.

The development configuration empowers users to tailor the underlying Express server.

```typescript
import { createDevConfig } from '@equinor/fusion-framework-cli';
import httpProxy from "http-proxy"

const proxy = httpProxy.createProxyServer();

const targetServer = 'http://example.com'; 

export default createDevConfig(() => ({
    express: (app)=>{
          app.all('*', (req, res) => {
            proxy.web(req, res, { target: targetServer });
          });
          
          // Error handling for proxy
          proxy.on('error', (err, req, res) => {
            console.error('Proxy Error:', err);
            res.status(500).send('Proxy Error');
          });
          
},
}));
```

```typescript
import { createDevConfig } from '@equinor/fusion-framework-cli';

export default createDevConfig(() => ({
    widgets: [
        {
            entryPoint: '/src/index.ts',
            assetPath: '../widget-react-test/',
            name: 'widget1',
        },
        {
            entryPoint: '/src/index.ts',
            assetPath: '../widget-react-test2/',
            name: 'widget2',
        },
    ],
}));
```

Additionally, a helper for widget development has been incorporated. The entry point can be configured to both compiled and source code. If set to source, developers gain the ability to utilize hot module replacements/auto-reload during development.


