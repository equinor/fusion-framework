# @equinor/fusion-framework-vite-plugin-octopus

Vite plugins that let a local Fusion portal load apps from their local dev servers, through **Octopus**: a small local registry and proxy. Apps that are not running locally still come from CI.

```
app dev servers ──register──▶ Octopus (:2000) ◀──app requests── portal dev server (:3000) ──otherwise──▶ CI
```

Most projects use this through the Fusion Framework CLI:

```sh
ffc portal dev --octopus   # in the portal: loads local apps, starts Octopus when it is not running
ffc app dev --octopus      # in each app: registers the app with Octopus
ffc octopus list           # see what is registered (or open http://localhost:2000)
```

In a Turbo repo, pass the flag through to the task: `pnpm dev my-portal -- --octopus`.

## Plugins

### `octopusAppPlugin` (app dev server)

```ts
import { octopusAppPlugin } from '@equinor/fusion-framework-vite-plugin-octopus';

octopusAppPlugin({
  appKey: 'my-app',
  octopusUrl: 'http://localhost:2000',
  mockUrl: 'http://localhost:4010', // when the dev server runs against a mock server
  sourceDir: 'src',
});
```

While the dev server runs, the plugin:

- registers the app key and the dev server's address with Octopus, and renews it every 5 seconds;
- unregisters when the dev server closes (Octopus also removes apps whose dev server stops answering);
- lets portals on this machine (`localhost`, `127.0.0.1`) import the app's modules across origins;
- scans `sourceDir` at startup, so the portal loading the app does not trigger a dependency re-bundle mid-load.

When Octopus is not running the app works as usual, and registers once Octopus starts.

### `octopusPortalPlugin` (portal dev server)

```ts
import { octopusPortalPlugin } from '@equinor/fusion-framework-vite-plugin-octopus';

octopusPortalPlugin({ octopusUrl: 'http://localhost:2000' });
```

- Manifest, config and script reads (`GET`, `HEAD`) for registered apps are answered from their dev server; everything else, including writes such as `PUT` of a build's config, goes on to the portal's API proxy (`/@fusion-api`), i.e. to CI.
- `GET /@fusion-api/octopus/apps/<appKey>` answers `{ "source": "local" | "mock" | "ci" }`, so the portal UI can show where an app comes from.
- API requests from an app in mock mode go to its mock server, for the services the mock server lists (`/@fusion-mock/discovery`). The plugin recognises the app by the `x-fusion-app` header the framework adds to the app's requests, and doesn't forward the portal's token. Other services, other apps and the portal itself use CI. Answers from the mock server carry `x-octopus: mock`.
- An app in mock mode never falls back to CI for the services it mocks: when its mock server doesn't list its services, or Octopus can't confirm the app is still in mock mode, its requests get a `502`.
- When nothing answers at the Octopus address, the plugin starts Octopus, and stops it when the dev server closes.
- Requests only go to Octopus once it is known to run. While it starts, and when another program has its port, everything goes to CI. The portal's token is never sent to Octopus or the app's dev server.

The plugin runs before other plugins (`enforce: 'pre'`), so it comes before the API proxy.

## Server

`@equinor/fusion-framework-vite-plugin-octopus/server` has the Octopus server itself, without a Vite dependency. `ffc octopus` uses it.

```ts
import { startOctopus } from '@equinor/fusion-framework-vite-plugin-octopus/server';

const octopus = await startOctopus(2000, console.log);
// …
await octopus.close();
```

| Request | Answer |
| --- | --- |
| `GET /` | Page listing the registered apps, with a link to each app's dev page and an Unregister button |
| `GET /api/apps` | Registered apps |
| `PUT /api/apps/:appKey` | Register or renew `{ url, mockUrl?, instanceId, startedAt? }`; `410` when unregistered by hand |
| `DELETE /api/apps/:appKey[?instanceId=]` | Unregister; with `instanceId` only that dev server's entry, without it (by hand) all of them until they restart |
| `/proxy/<apps API path>` | Manifest, config and scripts of registered apps (`GET`, `HEAD`); `404` with `x-octopus: miss` otherwise |

- An app can run in several dev servers at once, e.g. a normal one and one in mock mode, also in the same process. Each dev server registers as its own instance. The one that started last is used; when it stops, the next most recent takes over.
- Octopus removes dev servers without a heartbeat for 15 seconds, and dev servers that stop answering (checked every 2 seconds, and on each request).
- Octopus only listens on `127.0.0.1`, only answers requests addressed to `localhost`, `127.0.0.1` or `[::1]` (so a web page can't reach it through DNS rebinding), and only accepts `http://localhost` addresses.
- Octopus builds the address it forwards to from the registered dev server and the checked parts of the request: the app key, and for configs a build version made of letters, digits and `.`, `_`, `+`, `-`.

## Limits

- Only the app's code comes from the local dev server. Inside the portal the app uses the portal's login. An app in mock mode gets mock data for the services its mock server lists; all other services come from CI.
- Mock routing needs a framework version that sends `x-fusion-app`. Requests an app makes through the portal's own HTTP clients don't carry it, so they go to CI. A service the mock server adds, but CI service discovery doesn't know, can't be reached inside the portal.
- Octopus only loads apps from `http://` dev servers. A dev server with `server.https` isn't registered, and logs why.
- Version-tagged manifests (`$tag`), user settings and build lists always come from CI.
- For local development only.
