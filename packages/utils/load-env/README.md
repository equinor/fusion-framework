# Fusion Load ENV

A lightweight utility package for managing environment variables in Node.js applications. It provides tools for converting between JavaScript objects and environment variables, as well as loading variables from `.env` files with customizable prefix support.

## Features

- Convert JavaScript objects to environment variable strings and vice versa.
- Load environment variables from `.env` files with support for different environments (e.g., `dev`, `prod`).
- Customizable prefix for namespacing environment variables to prevent conflicts.
- Support for camelCase key transformations.
- Skips variables without the specified prefix for clean processing.

## Installation

```bash
npm install @equinor/fusion-load-env
```

## Default Prefix

The `DEFAULT_ENV_PREFIX` constant (default: `FUSION`) is used to namespace environment variables, ensuring no conflicts with other variables. Only variables starting with this prefix are processed unless a custom prefix is specified.

## Usage

### `objectToEnv`

Converts a JavaScript object into environment variable strings. Nested objects are flattened with underscores.

#### Syntax
```javascript
objectToEnv(obj, [prefix])
```

- `obj`: The object to convert.
- `prefix`: Optional custom prefix (defaults to `DEFAULT_ENV_PREFIX`).

#### Example
```javascript
const { objectToEnv } = require('@equinor/fusion-load-env');

const envObject = { 
  key: 'value', 
  anotherKey: 'anotherValue',
  complex: {
    object: 'foo'
  }
};

console.log(objectToEnv(envObject));
// Output:
// FUSION_KEY=value
// FUSION_ANOTHER_KEY=anotherValue
// FUSION_COMPLEX_OBJECT=foo

console.log(objectToEnv(envObject, 'CUSTOM'));
// Output:
// CUSTOM_KEY=value
// CUSTOM_ANOTHER_KEY=anotherValue
// CUSTOM_COMPLEX_OBJECT=foo
```

### `envToObject`

Parses environment variables into a JavaScript object. Only variables with the specified prefix are included. Supports camelCase transformations for specific keys.

#### Syntax
```javascript
envToObject(env, [options])
```

- `env`: Object containing environment variables (e.g., `process.env`).
- `options`:
  - `prefix`: Custom prefix to filter variables (defaults to `DEFAULT_ENV_PREFIX`).
  - `camelcase`: Array of key suffixes to convert to camelCase.

#### Example
```javascript
const { envToObject, DEFAULT_ENV_PREFIX } = require('@equinor/fusion-load-env');

const envs = {
  [`${DEFAULT_ENV_PREFIX}_KEY`]: 'value',
  [`${DEFAULT_ENV_PREFIX}_ANOTHER_KEY`]: 'another value',
  CUSTOM_KEY: 'custom'
};

console.log(envToObject(envs));
// Output:
// { key: 'value', another: { key: 'another value' } }

console.log(envToObject(envs, { camelcase: ['ANOTHER_KEY'] }));
// Output:
// { key: 'value', anotherKey: 'another value' }

console.log(envToObject(envs, { prefix: 'CUSTOM' }));
// Output:
// { key: 'custom' }
```

### `loadEnv`

Loads environment variables from `.env` files into `process.env`. Supports environment-specific files (e.g., `.env.dev`, `.env.local`). Only variables with the specified prefix are loaded.

#### Syntax
```javascript
loadEnv([envName], [options])
```

- `envName`: Environment name (e.g., `dev`, `prod`). Loads files like `.env`, `.env.[envName]`, `.env.local`, `.env.[envName].local`.
- `options`:
  - `prefix`: Custom prefix (defaults to `DEFAULT_ENV_PREFIX`).

#### Example
```javascript
const { loadEnv } = require('@equinor/fusion-load-env');

// Loads .env, .env.local, .env.dev, .env.dev.local
const envs = loadEnv('dev');

// Output depends on .env file contents
console.log(envs);
```

## Configuration

- **Custom Prefix**: Override `DEFAULT_ENV_PREFIX` by passing a `prefix` option to any function.
- **Environment Files**: The `loadEnv` function prioritizes files in this order: `.env`, `.env.local`, `.env.[envName]`, `.env.[envName].local`.
- **CamelCase**: Use the `camelcase` option in `envToObject` to transform specific keys.

## Notes

- Ensure `.env` files are not committed to version control. Add them to `.gitignore`.
- The package does not modify variables without the specified prefix, ensuring safe integration with existing environment setups.
- Nested objects in `objectToEnv` are flattened using underscores (e.g., `complex.object` becomes `COMPLEX_OBJECT`).