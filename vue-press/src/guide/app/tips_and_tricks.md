---
title: Tips and Tricks
category: Guide
tags:
  - how to
  - basic
  - app
---

![CookBooks](./faq.png)


## Keep packages up to-date
Fusion Framework is a mono repo, which means all packages are built in relation. Normally this would not cause issue, but good practice is to have all framework packages on the same build.

![npm](https://img.shields.io/npm/v/npm-check-updates?label=npm-check-updates&style=for-the-badge)

install npm-check-updates globally
```sh
npm install -g npm-check-updates
```

update all packages related to Fusion Framework
```sh
ncu -i -f /fusion-framework/ -t latest
```

## Linting code

- ![npm](https://img.shields.io/npm/v/eslint?label=eslint&style=for-the-badge)
- ![npm](https://img.shields.io/npm/v/prettier?label=prettier&style=for-the-badge)
- ![npm](https://img.shields.io/npm/v/typescript?label=typescript&style=for-the-badge)

::: tabs

@tab React

![npm](https://img.shields.io/npm/v/@equinor/eslint-config-fusion-react?label=@equinor/eslint-config-fusion-react&style=for-the-badge)

@tab POJ

![npm](https://img.shields.io/npm/v/@equinor/eslint-config-fusion?label=@equinor/eslint-config-fusion&style=for-the-badge)

:::

```yaml
name: Lint project files
on: [pull_request]
jobs:
  eslint:
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - name: Install Node Dependencies
        run: npm ci
      - name: Save Code Linting Report JSON
        # "lint:report": "eslint --output-file eslint-report.log.json --format json ./src/**"
        run: npm run lint:report
        continue-on-error: true
      - name: Annotate Code Linting Results
        uses: ataylorme/eslint-annotate-action@1.2.0
        with:
          repo-token: "${{ github.token }}"
          report-json: "eslint-report.log.json"
      - name: Upload ESLint report
        uses: actions/upload-artifact@v2
        with:
          name: eslint-report.log.json
          path: eslint-report.log.json
```
