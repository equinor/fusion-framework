---
title: Tips and Tricks
category: Guide
tag:
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
