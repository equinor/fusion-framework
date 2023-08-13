# Developing Cookbooks

> Cookbooks should __only__ have the necessary code for illustrating a scenario.
> code should follow [KISS principle](https://en.wikipedia.org/wiki/KISS_principle) with good comments

## Getting started

see [development](./development.md) for initial setup

### Running an existing cookbook
```sh
cd cookbooks/app-react
pnpm dev
```

### Creating a new cookbook
```sh
cp -r cookbooks/app-react cookbooks/app-react-2
rm cookbooks/app-react-2/CHANGELOG.md
```

- change `name` in `package.json`
- reset the version to `0.0.0` in `package.json`

## Dependencies

when adding internal dependencies, the `tsconfig.json` should also reflect those packages.

```json
{
  "references": [
    { "path": "../../packages/react/app" },
    { "path": "../../packages/cli" },
  ],
}
```

> the CLI might not register changes in dependencies, sp good practice is to rebuild all packages when changes are made