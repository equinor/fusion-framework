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


::: code-tabs

@tab Run locally
```sh
yarn && yarn build
cd cookbooks/app-react
yarn dev
# follow link to http://localhost:3000/apps/app-react
```

@tab Run in own folder
```sh
# $FRAMEWORK_DIRECTORY = the directory which you cloned/forked the repo to
# $MY_APP_DIR = the directory you wish to develop in
cp -r $FRAMEWORK_DIRECTORY/cookbooks/app-react $MY_APP_DIR
cd $MY_APP_DIR
yarn
yarn dev
# follow link to http://localhost:3000/apps/app-react
```

:::

::: tabs

@tab React
- [a simple plain react app](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react)
- [an application with react router 6](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-router)
- [an application with context](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-context)
- [an application with bookmark](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-bookmark)
- [an application with AG-grid](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-ag-grid)

:::

