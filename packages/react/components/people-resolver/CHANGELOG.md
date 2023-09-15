# @equinor/fusion-framework-react-components-people-provider

## 1.0.1

### Patch Changes

-   [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

-   Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
    -   @equinor/fusion-framework-react@5.3.1
    -   @equinor/fusion-framework-react-module-bookmark@2.0.19
    -   @equinor/fusion-framework-react-module@3.0.6
    -   @equinor/fusion-query@4.0.1

## 1.0.0

### Major Changes

-   [#1255](https://github.com/equinor/fusion-framework/pull/1255) [`de46f0a2`](https://github.com/equinor/fusion-framework/commit/de46f0a2ce93134fc32bf587d29dd32d7ab9a8d9) Thanks [@odinr](https://github.com/odinr)! - Component for providing people api resources to the @equinor/fusion-wc-person and @equinor/fusion-react-person components

    mapping and caching of `@equinor/fusion-framework-module-services/people`

    > Strongly collated to the Fusion ecosystems

    ```tsx
    import { PeopleResolverProvider } from '@equinor/fusion-framework-react-components-people-provider';

    <PeopleResolverProvider>
        <fwc-person-avatar azureId="cbc6480d-12c1-467e-b0b8-cfbb22612daa"></fwc-person-avatar>
        <fwc-person-card azureId="cbc6480d-12c1-467e-b0b8-cfbb22612daa"></fwc-person-card>
        <fwc-person-list-item azureId="cbc6480d-12c1-467e-b0b8-cfbb22612daa"></fwc-person-list-item>
    </PeopleResolverProvider>;
    ```

    > we might in the future provide a module which provides same functionality as the resolver
    >
    > atm there are no flexible way to configure this provider since the api models are strongly collated to the models of the components
    >
    > if requested we can create a provider for the functionality

### Patch Changes

-   Updated dependencies [[`3896fbec`](https://github.com/equinor/fusion-framework/commit/3896fbec3458dbe2ebd66e772465d5f89cd20658), [`ebcabd0e`](https://github.com/equinor/fusion-framework/commit/ebcabd0e6945e1420a0a9a7d82bd9255da1b8578), [`8739a5a6`](https://github.com/equinor/fusion-framework/commit/8739a5a65d8aaa46ce9ef56cce013efeeb006e8a)]:
    -   @equinor/fusion-framework-react@5.3.0
    -   @equinor/fusion-query@4.0.0
    -   @equinor/fusion-framework-react-module-bookmark@2.0.18
