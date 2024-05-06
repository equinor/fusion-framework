---
title: Cookbooks
category: Guide
tag:
  - how to
  - basic
  - app
  - cookbooks
---

![CookBooks](./cookbook.png)

As we develop features in Fusion Framework, we also develop Cookbooks to test and show examples of these new features. We believe that there are no __template to rule em all__, secondly it takes a lot of effort to
maintain such templates (which the user scraps anyway). Therefor we try to show practical small example of usage in these cookbooks _(we encourage developers to submit cookbooks if they find use cases which we have not covered)_.

> a future dream would be to run these cookbooks in a code playground, so developers could interactively test out different scenarios


::: code-tabs

@tab https

```sh
git clone https://github.com/equinor/fusion-framework.git
```
@tab:active ssh

```sh
git clone git@github.com:equinor/fusion-framework.git
```
@tab GitHub CLI

```sh
gh repo clone equinor/fusion-framework
```

:::


```sh
# install and build fusion framework
pnpm i
pnpm build:packages
cd cookbooks/app-react
pnpm dev
# follow link to http://localhost:3000/apps/app-react
```

:::

::: tabs

@tab:active React
- [a simple plain react app](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react)
- [an application with react router 6](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-router)
- [an application with context](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-context)
- [an application with bookmark](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-bookmark)
- [an application with AG-grid](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-ag-grid)
- [an application with Context](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-context)
- [an application with Context error](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-context-custom-error)
- [an application with custom module](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-custom-modules)
- [an application with custom module](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-feature-flag)
- [an application with custom module](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-msal)
- [an application with custom module](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-people)

@tab Vanilla
- [a plain application](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-vanilla)
:::

