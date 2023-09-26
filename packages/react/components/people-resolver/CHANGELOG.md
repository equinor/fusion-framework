# @equinor/fusion-framework-react-components-people-provider

## 1.1.0

### Minor Changes

-   [`3e38c9cc`](https://github.com/equinor/fusion-framework/commit/3e38c9cc925fc0456837e42e7ee3ac55e9553bad) Thanks [@odinr](https://github.com/odinr)! - Observer provided abort signal

### Patch Changes

-   [`cc7bcfb5`](https://github.com/equinor/fusion-framework/commit/cc7bcfb51187fb757b95793356da4a11b233d930) Thanks [@odinr](https://github.com/odinr)! - update @equinor/fusion-wc-person to 1.1.1

-   [#1306](https://github.com/equinor/fusion-framework/pull/1306) [`f65c4531`](https://github.com/equinor/fusion-framework/commit/f65c453178e2c581acb154d5839971c75f60fa86) Thanks [@odinr](https://github.com/odinr)! - Allow providing fallback image

    when defining a `PeopleResolverProvider`, one might want to provide a blob for fallback when a person photo is not found.

    > this will increase the general resolve time, since repeating request for resolving a person photo will not execute a new query until cache expires

    ```tsx
    import { PeopleResolverProvider } from '@equinor/fusion-framework-react-components-people-provider';
    import fallbackSvg from './resources/fallback-photo.svg';

    const fallbackImage = new Blob([fallbackSvg], { type: 'image/svg+xml' });

    const App = () => (
        <PeopleResolverProvider options={{ fallbackImage }}>...children</PeopleResolverProvider>
    );
    ```

-   [`9f121865`](https://github.com/equinor/fusion-framework/commit/9f121865254a0c76c4a812e6e42bfe3c7086c714) Thanks [@odinr](https://github.com/odinr)! - update types

-   [`518b8476`](https://github.com/equinor/fusion-framework/commit/518b8476bb40255d05e937663d3a513de479a1f8) Thanks [@odinr](https://github.com/odinr)! - fixed query args for abort signal

-   [#1345](https://github.com/equinor/fusion-framework/pull/1345) [`9d9f629e`](https://github.com/equinor/fusion-framework/commit/9d9f629e007df38db75067781b251b7e5e9673da) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - update @equinor/fusion-wc-person to 2.0.1

-   [`63592229`](https://github.com/equinor/fusion-framework/commit/63592229cea4d3606289738fe14b432e9978623f) Thanks [@odinr](https://github.com/odinr)! - fixed prop interface of `PeopleResolverComponent`

-   Updated dependencies [[`ddc31c35`](https://github.com/equinor/fusion-framework/commit/ddc31c3571e36be057095238cf22e78051f423b0), [`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9)]:
    -   @equinor/fusion-framework-module-services@3.2.2
    -   @equinor/fusion-query@4.0.2
    -   @equinor/fusion-framework-react-module-bookmark@2.0.20
    -   @equinor/fusion-framework-react@5.3.2

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
