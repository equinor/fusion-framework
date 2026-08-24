# @equinor/fusion-framework-cli-plugin-mock-server

Fusion Framework CLI (`ffc`) plugin adding the `ffc mock-server` command: a standalone HTTP
mock backend for `@equinor/fusion-openapi-mock`, serving every service discovered from a
directory of OpenAPI specs at its own address — wired into the same CLI a Fusion app already
uses for `ffc app dev`/`ffc app build`.

## Who should use this

Anyone already using `@equinor/fusion-openapi-mock-server` who'd rather invoke it through
`ffc` than install and run a separate binary — no change in behavior, just one CLI surface
instead of two.

## Quick start

`ffc mock-server` is already available in `@equinor/fusion-framework-cli` — installing this
package is enough, no `fusion-cli.config.ts` entry required:

```sh
pnpm add -D @equinor/fusion-framework-cli-plugin-mock-server
ffc mock-server ./mocks --port 4010
```

If the package isn't installed, `ffc mock-server` still exists as a command but prints an
install hint instead of starting a server.

### Run it

```sh
# bundled Fusion baseline (the default) layered under this app's own specs
ffc mock-server ./mocks --port 4010
```

### Set this app's own defaults

Pass options to `mockServerPlugin(...)` to change the command's own built-in
`--preset`/`--port`/`--host` defaults for this app — any of these can still be overridden
per-invocation by passing the flag explicitly.

```ts
import { defineFusionCli } from '@equinor/fusion-framework-cli';
import mockServerPlugin from '@equinor/fusion-framework-cli-plugin-mock-server';

export default defineFusionCli(() => ({
  plugins: [mockServerPlugin({ preset: ['fusion'], port: 4010 })],
}));
```

## Command reference — `ffc mock-server`

```
ffc mock-server [dirs...] [options]
```

| Argument/Option | Description |
| --- | --- |
| `[dirs...]` | Directories of OpenAPI specs to serve, in ascending precedence — a later directory's services replace an earlier one's by key. |
| `--preset <name>` | Bundled preset to layer in (e.g. `fusion`); repeatable. Every `--preset` is applied *before* every positional directory, regardless of flag position on the command line. Defaults to `fusion`; the first explicit `--preset` replaces that default rather than adding to it — repeat the flag (`--preset=fusion --preset=other`) to combine it with another preset. |
| `--port <port>` | Port to listen on (default: OS-assigned). |
| `--host <host>` | Hostname to bind to (default: `localhost`). |
| `--seed <seed>` | Seeds every service's faked responses, so the same document/fields/seed always fake the same values (default: unseeded/random). |

Runs in the foreground and shuts down on `SIGINT`/`SIGTERM` — pair it with Playwright's
`webServer` (or `concurrently`), rather than backgrounding it yourself, so nothing owns a
process it isn't also responsible for stopping.

See [`@equinor/fusion-openapi-mock-server`](../../utils/openapi-mock-server/README.md) for the
directory convention, the bundled `fusion` preset, and the routes the server exposes
(`/@fusion-mock/discovery`, `/@fusion-mock/reset`, `/@fusion-mock/:service/:operationId`, ...).

## License

ISC
