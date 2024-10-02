---
'@equinor/fusion-framework-cli': patch
---


### Changes

- Updated the service discovery URL in [`getEndpointUrl`](packages/cli/src/bin/utils/getEndpointUrl.ts) to use the production endpoint.
- Improved error handling in [`publishAppConfig`](packages/cli/src/bin/utils/publishAppConfig.ts) by changing the status code check from `> 399` to `>= 400`.
- Removed unnecessary `await` in JSON response parsing in [`publishAppConfig`](packages/cli/src/bin/utils/publishAppConfig.ts), [`tagAppBundle`](packages/cli/src/bin/utils/tagAppBundle.ts), and [`uploadAppBundle`](packages/cli/src/bin/utils/uploadAppBundle.ts).

### Detailed Changes

- **Service Discovery URL Update**:
  - Changed the URL in `getEndpointUrl` from:
    ```diff
    - `https://discovery.ci.fusion-dev.net/service-registry/environments/${fusionEnv}/services/apps`,
    + `https://discovery.fusion.equinor.com/service-registry/environments/${fusionEnv}/services/apps`,
    ```

- **Error Handling Improvement**:
  - Updated the status code check in `publishAppConfig`:
    ```diff
    - } else if (!requestConfig.ok || requestConfig.status > 399) {
    + } else if (!requestConfig.ok || requestConfig.status >= 400) {
    ```

- **Removed Unnecessary `await`**:
  - In `publishAppConfig`:
    ```diff
    - return await requestConfig.json();
    + return requestConfig.json();
    ```
  - In `tagAppBundle`:
    ```diff
    - return await requestTag.json();
    + return requestTag.json();
    ```
  - In `uploadAppBundle`:
    ```diff
    - return await requestBundle.json();
    + return requestBundle.json();
    ```
