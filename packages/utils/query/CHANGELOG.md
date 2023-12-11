# Change Log

## 4.0.4

### Patch Changes

-   [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

-   Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
    -   @equinor/fusion-observable@8.1.3

## 4.0.3

### Patch Changes

-   [#1410](https://github.com/equinor/fusion-framework/pull/1410) [`446b63ce`](https://github.com/equinor/fusion-framework/commit/446b63ce44b59a3aaab4399c0d877d3a1b560a0e) Thanks [@odinr](https://github.com/odinr)! - fixed queuing of query queue tasks

## 4.0.2

### Patch Changes

-   [#1305](https://github.com/equinor/fusion-framework/pull/1305) [`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9) Thanks [@odinr](https://github.com/odinr)! - fixed issue where queries where executed before observed.

    > **This fix might break existing code, if observation was wrongly implemented!**

    ```ts
    const queryClient = new Query({
        client: {
            fn: async (value: string) =>
                new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(value);
                    }, 50);
                }),
        },
        key: (value) => value,
    });

    /** execute observables sequential */
    concat(
        /** after 100ms emits 'foo' */
        interval(100).map(() => 'foo'),
        /** after 50ms emits 'bar' */
        queryClient.query('bar'),
    ).subscribe(console.log);
    ```

    **expected result:**

    ```diff
    + 100ms 'foo' 50ms 'bar' |
    ```

    **actual result:**

    ```diff
    - 50ms 'bar' 50ms 'foo' |
    ```

    this is now resolved by having an inner task which is not add request to the queue before the task is observed

## 4.0.1

### Patch Changes

-   [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

-   Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
    -   @equinor/fusion-observable@8.1.2

## 4.0.0

### Major Changes

-   [#1271](https://github.com/equinor/fusion-framework/pull/1271) [`ebcabd0e`](https://github.com/equinor/fusion-framework/commit/ebcabd0e6945e1420a0a9a7d82bd9255da1b8578) Thanks [@odinr](https://github.com/odinr)! - Change abort behavior of QueryClient

    this also fixes the issue where only the first requester of a request could provide abort controller.

    _success_:

    ```ts
    const controllerA = new AbortController();
    const controllerB = new AbortController();
    const tasks = Promise.All([
        foo.query('bar', { controller: controllerA }),
        foo.query('bar', { controller: controllerB }),
    ]);
    try {
        setTimeout(() => controllerA.abort(), 10);
        await tasks;
    } catch (err) {
        // success
    }
    ```

    ```diff
    - setTimeout(() => controllerA.abort(), 10);
    + setTimeout(() => controllerB.abort(), 10);
    ```

    query wil no longer abort since task is attached to `controllerA`

    > the query client will return the ongoing task _(if not completed)_ for matching query key.

    ```ts
    let calls = 0;
    const query = new Query({
        client: {
            queueOperator: 'merge',
            fn: (value) => {
                return new Promise((resolve) =>
                    setTimeout(() => {
                        call++;
                        resolve(value);
                    }, 100),
                );
                value;
            },
        },
        key: (value) => value,
    });
    setTimeout(
        // calls = 1
        () => query.queryAsync('foo').then(() => console.log(calls)),
        0,
    );
    setTimeout(
        // calls = 1, since sharing first request
        () => query.queryAsync('foo').then(() => console.log(calls)),
        50,
    );
    setTimeout(
        // calls = 2
        () => query.queryAsync('bar').then(() => console.log(calls)),
        100,
    );
    setTimeout(
        // calls = 3
        () => query.queryAsync('foo').then(() => console.log(calls)),
        150,
    );
    ```

    -   expose current state of cache `QueryCache`
    -   update request handler to support signal
    -   update request processor to handle signal
    -   remove `AbortController` from action meta
    -   add functionality for aborting request by reference

    **BREAKING_CHANGES:**

    ```diff
     export type QueryClientOptions<TType = any, TArgs = any> = {
    -    controller: AbortControl
    +    signal?: AbortSignal;
         retry: Partial<RetryOptions>;
         /** reference to a query  */
         ref?: string;
         task?: Subject<QueryTaskValue<TType, TArgs>>;
    };
    ```

    migration

    ```diff
    const foo = new Query(...);
    const controller = new AbortController();
    foo.query(
      args,
    - {controller}
    + {signal: controller.signal}
    );
    ```

### Patch Changes

-   [`8739a5a6`](https://github.com/equinor/fusion-framework/commit/8739a5a65d8aaa46ce9ef56cce013efeeb006e8a) Thanks [@odinr](https://github.com/odinr)! - Allow optionial ctor args in QueryCache

## 3.0.7

### Patch Changes

-   Updated dependencies [[`6f64d1aa`](https://github.com/equinor/fusion-framework/commit/6f64d1aa5e44af37f0abd76cef36e87761134760), [`758eaaf4`](https://github.com/equinor/fusion-framework/commit/758eaaf436ae28d180e7d91818b41abe0d9624c4)]:
    -   @equinor/fusion-observable@8.1.1

## 3.0.6

### Patch Changes

-   [`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594) Thanks [@odinr](https://github.com/odinr)! - Query cache missed on first access since when creating a new cache record, updated was never set.

    > when creating a cache item, `entry.created` and `entry.updated` are set to `Date.now()`, but `entry.updates` are only incremented when updating.

    > when invalidating a cache record, `entry.updated` is deleted, which triggers the `defaultCacheValidator` to miss cache

    ```ts
    const defaultCacheValidator =
        <TType, TArgs>(expires = 0): CacheValidator<TType, TArgs> =>
        (entry) =>
            (entry.updated ?? 0) + expires > Date.now();
    ```

    **IMPORTANT**

    any consumer of this package should update ASAP to improve network performance.

    _discovered when duplicate service discovery calls was executed from cli portal_

## 3.0.5

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

    only dev deps updated should not affect any consumers

    see [react changelog](https://github.com/facebook/react/releases) for details

-   [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
    -   @equinor/fusion-observable@8.1.0

## 3.0.4

### Patch Changes

-   [#1045](https://github.com/equinor/fusion-framework/pull/1045) [`38869a87`](https://github.com/equinor/fusion-framework/commit/38869a87788c340d363e9be1e7fc6ce0e29efa63) Thanks [@eikeland](https://github.com/eikeland)! - remove immer as dependency (required in @equinor/fusion-observable)

-   Updated dependencies [[`b16e93e2`](https://github.com/equinor/fusion-framework/commit/b16e93e23e456ab065a414f4bdc44445b6e9ad9f), [`b16e93e2`](https://github.com/equinor/fusion-framework/commit/b16e93e23e456ab065a414f4bdc44445b6e9ad9f), [`b16e93e2`](https://github.com/equinor/fusion-framework/commit/b16e93e23e456ab065a414f4bdc44445b6e9ad9f), [`38869a87`](https://github.com/equinor/fusion-framework/commit/38869a87788c340d363e9be1e7fc6ce0e29efa63)]:
    -   @equinor/fusion-observable@8.0.3

## 3.0.3

### Patch Changes

-   [#943](https://github.com/equinor/fusion-framework/pull/943) [`6fb3fb86`](https://github.com/equinor/fusion-framework/commit/6fb3fb8610f5ed5777d13bde71d8d92b0da31d8a) Thanks [@odinr](https://github.com/odinr)! - build(@equinor/fusion-query): bump uuid from 8.3.2 to 9.0.0

-   Updated dependencies [[`6fb3fb86`](https://github.com/equinor/fusion-framework/commit/6fb3fb8610f5ed5777d13bde71d8d92b0da31d8a)]:
    -   @equinor/fusion-observable@8.0.2

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 3.0.2 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-query

## 3.0.1 (2023-05-05)

### Bug Fixes

-   **util-query:** add name to error ([630dd88](https://github.com/equinor/fusion-framework/commit/630dd88f6bf01aacdb155a3cd45730e434a6cd8f))

## 3.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-query

## 2.0.7 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-query

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@2.0.5...@equinor/fusion-query@2.0.6) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-query

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@2.0.4...@equinor/fusion-query@2.0.5) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-query

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@2.0.3...@equinor/fusion-query@2.0.4) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-query

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@2.0.2...@equinor/fusion-query@2.0.3) (2023-02-09)

### Bug Fixes

-   **util/query:** enhance selection of queue operator ([b41a99f](https://github.com/equinor/fusion-framework/commit/b41a99fb046bd3adbd2ede2b38ebb1edf7eba3d8))
-   **util/query:** expose queue operators ([f597f25](https://github.com/equinor/fusion-framework/commit/f597f25f98198e46a600309898ac9f2557c973f3))
-   **util/query:** only cancel all request when transaction is not specified ([3ece6a3](https://github.com/equinor/fusion-framework/commit/3ece6a3d8d59f12036e9e329e3a4ff677dd87fec))

## 2.0.2 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-query

## 2.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-query

## 2.0.0 (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-query

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@1.1.4...@equinor/fusion-query@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-query

## 1.1.4 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-query

## 1.1.3 (2022-12-14)

**Note:** Version bump only for package @equinor/fusion-query

## [1.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@1.1.1...@equinor/fusion-query@1.1.2) (2022-12-12)

### Bug Fixes

-   **utils/query:** fix causation of error ([108f1b4](https://github.com/equinor/fusion-framework/commit/108f1b418f0f0b561c9bc3a5a0e41e5e8ad50f2f))

## 1.1.1 (2022-12-08)

### Bug Fixes

-   **utils/query:** debounce cancelation of request ([f280bb8](https://github.com/equinor/fusion-framework/commit/f280bb812384d1c183372f8f68dda1de29995fff))

## [1.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@1.0.2...@equinor/fusion-query@1.1.0) (2022-12-08)

### Features

-   **utils/query:** improve error handling ([1cec132](https://github.com/equinor/fusion-framework/commit/1cec132ea022f9fc81464ceb03e5aa4f7e8b4951))

## 1.0.2 (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-query

## 1.0.1 (2022-12-05)

### Bug Fixes

-   **query:** bind query method in hook ([d440f19](https://github.com/equinor/fusion-framework/commit/d440f1940c19717bc7adf0da405454af87eda541))

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.3.1...@equinor/fusion-query@1.0.0) (2022-12-02)

### Features

-   update exiting debounce hooks ([27e716c](https://github.com/equinor/fusion-framework/commit/27e716ca253206d532e0f02233beb6f29c10de22))

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.3.1...@equinor/fusion-query@1.0.0-alpha.0) (2022-12-02)

### Features

-   update exiting debounce hooks ([dd3eb5f](https://github.com/equinor/fusion-framework/commit/dd3eb5ff1a05edd6c25fd1ad65c0b68d50f5799a))

## [0.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.3.0...@equinor/fusion-query@0.3.1) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-query

## [0.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.2.7...@equinor/fusion-query@0.3.0) (2022-12-01)

### Features

-   **query:** rewrite query actions and reducer ([48b9982](https://github.com/equinor/fusion-framework/commit/48b99822619e7c7e3e20257d9a89a0cc5a5cc84e))

### Bug Fixes

-   fix import typos ([fdfebd5](https://github.com/equinor/fusion-framework/commit/fdfebd5036dd76d72110fb61a2db9a04ad806408))
-   **query:** fix import of uuid ([d8700fc](https://github.com/equinor/fusion-framework/commit/d8700fcd1ae6a522741c0a12f4c2f1f3934147cd))

## [0.2.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.2.6...@equinor/fusion-query@0.2.7) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-query

## [0.2.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.2.5...@equinor/fusion-query@0.2.6) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-query

## [0.2.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.2.4...@equinor/fusion-query@0.2.5) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-query

## [0.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.2.3...@equinor/fusion-query@0.2.4) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-query

## [0.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.2.2...@equinor/fusion-query@0.2.3) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-query

## [0.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.2.0...@equinor/fusion-query@0.2.2) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-query

## [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.1.2...@equinor/fusion-query@0.2.0) (2022-12-01)

### Features

-   **observable:** expose function for creating actions ([26e1731](https://github.com/equinor/fusion-framework/commit/26e17313fb9e1a4e329f3d4b037fbcf75688d224))

## [0.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.1.1...@equinor/fusion-query@0.1.2) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-query

## [0.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.1.0...@equinor/fusion-query@0.1.1) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-query

## 0.1.0 (2022-12-01)

### Features

-   **query:** separate query from observable ([1408609](https://github.com/equinor/fusion-framework/commit/140860976c3ee9430a30deebcc8b08da857e5772))
