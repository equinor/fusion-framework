# @equinor/fusion-load-env

Lightweight Node.js utilities for loading, parsing, and serializing environment variables with prefix-based namespacing.  
Use it to read `.env` files at startup, convert between flat `KEY=value` records and nested configuration objects, and ensure only variables with a known prefix leak into your application.

## When to use this package

- You need to load `.env` / `.env.local` / `.env.<mode>` files in a Node CLI, dev-server, or build script.
- You want to convert a nested config object into `UPPER_SNAKE_CASE` env vars (e.g. for Docker or CI).
- You want to rehydrate structured config from `process.env` at runtime.

## Installation

```bash
pnpm add @equinor/fusion-load-env
```

## Quick start

```ts
import { loadEnv, envToObject, objectToEnv, DEFAULT_ENV_PREFIX } from '@equinor/fusion-load-env';

// 1. Load all FUSION_* variables from .env files for "dev" mode
const env = loadEnv({ mode: 'dev' });

// 2. Parse the flat env record into a nested config object
const config = envToObject<{ api: { url: string } }>(env);
// → { api: { url: '...' } }

// 3. Serialize a config object back to flat env vars
const flat = objectToEnv({ api: { url: 'https://example.com' } });
// → { FUSION_API_URL: 'https://example.com' }
```

## Key concepts

### Prefix namespacing

Every utility defaults to the `FUSION` prefix (exported as `DEFAULT_ENV_PREFIX`).  
Only variables whose key starts with the prefix are included when loading or parsing, and the prefix is prepended when serializing. Pass a custom `prefix` / `prefixes` option to override.

### Mode-specific `.env` files

`loadEnv` resolves files in this order (later files override earlier ones):

| Priority | File                    |
| -------- | ----------------------- |
| 1        | `.env`                  |
| 2        | `.env.local`            |
| 3        | `.env.<mode>`           |
| 4        | `.env.<mode>.local`     |

Inline `process.env` values always take the highest priority so that CI/CD flags win.

### CamelCase flattening control

By default `envToObject` splits every `_` segment into a nested level. Pass `camelcase: ['SOME_KEY']` to keep specific suffixes flat and convert them to camelCase instead.

## API reference

| Export               | Description |
| -------------------- | ----------- |
| `loadEnv(options)`   | Load `.env` files for a given mode and return matching variables as a flat record. |
| `envToObject(env, options?)` | Parse a flat env-var record into a nested typed configuration object. |
| `objectToEnv(obj, options?)` | Serialize a nested config object into a flat `UPPER_SNAKE_CASE` record. |
| `DEFAULT_ENV_PREFIX` | The default prefix constant (`"FUSION"`). |
| `getEnvFilesForMode(envDir, mode?)` | Resolve the ordered list of `.env` file paths for a directory and mode. |

## Common patterns

### Custom prefix

```ts
const env = loadEnv({ mode: 'production', prefixes: 'MY_APP' });
const config = envToObject(env, { prefix: 'MY_APP' });
```

### Multiple prefixes

```ts
const env = loadEnv({ prefixes: ['FUSION', 'VITE'] });
```

### Serialize config for Docker

```ts
import { objectToEnv } from '@equinor/fusion-load-env';

const envRecord = objectToEnv(
  { clientId: 'abc-123', feature: { darkMode: true } },
  { prefix: 'FUSION' },
);
// { FUSION_CLIENT_ID: 'abc-123', FUSION_FEATURE_DARK_MODE: 'true' }
```

## Notes

- The mode name `"local"` is reserved and will throw — it conflicts with the `.local` file-suffix convention.
- Leaf values are JSON-parsed by `envToObject`, so booleans and numbers arrive as native types. Wrap plain strings in quotes in your `.env` file (e.g. `FUSION_NAME="hello"`).
- Ensure `.env` files are listed in `.gitignore` to prevent secrets from being committed.