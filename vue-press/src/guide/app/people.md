---
title: People components
category: Guide
tag:
    - how to
    - basic
    - app
    - cookbooks
    - people
---

There are a set of people components: avatar, card, list item and selector.

## Installation

```sh
npm install @equinor/fusion-react-person
```

## Person Provider

In order to use these components you need to have **PersonProvider** wrapper.

```html
<fwc-person-provider .resolver={resolver}>
  <!-- will do default search -->
  <fwc-person-search></fwc-person-search>
  <fwc-person-provider .resolver={customResolver}>
    <!-- only display person with title 'foobar', but images are resolved from parent provider -->
    <fwc-person-search></fwc-person-search>
  </fwc-person-provider>
</fwc-person-provider>
```
```ts
const controller: MainController;
const resolver: PersonResolver = {
  search: (args) => controller.search(args),
  getPhoto: (args) => controller.getPhoto(args)
}
const customResolver: PersonResolver = {
  search: (args) => controller.search(args).filter(x => x.title === 'foobar'),
}
```

## Links

- [Cookbook](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-people)
- [Storybook](https://equinor.github.io/fusion-react-components/?path=/docs/data-person)
- [Fusion React Components People](https://github.com/equinor/fusion-react-components/tree/main/packages/person)
- [Fusion Web Components People](https://github.com/equinor/fusion-web-components/tree/main/packages/person)

## Example code

::: code-tabs
@tab Avatar
@[code](@cookbooks/app-react-people/src/pages/AvatarPage.tsx)

@tab Card
@[code](@cookbooks/app-react-people/src/pages/CardPage.tsx)

@tab ListItem
@[code](@cookbooks/app-react-people/src/pages/ListItemPage.tsx)

@tab Selector
@[code](@cookbooks/app-react-people/src/pages/SelectorPage.tsx)
:::
