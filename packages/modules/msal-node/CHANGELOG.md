# @equinor/fusion-framework-module-msal-node

## 0.1.0

### Minor Changes

- [#3056](https://github.com/equinor/fusion-framework/pull/3056) [`378bade`](https://github.com/equinor/fusion-framework/commit/378bade86c38e1057afe125fffc0bb06d6927deb) Thanks [@odinr](https://github.com/odinr)! - Easily add secure Azure AD authentication to your Node.js Fusion Framework apps with the new `@equinor/fusion-framework-module-msal-node` package. This module is designed for developers who need to authenticate services, CLI tools, or background jobs against Microsoft Azure using familiar, robust MSAL flows—without the hassle of manual token management or insecure storage.

  **Why use this module?**

  - **Simple integration:** Plug into the Fusion Framework with minimal setup.
  - **Multiple auth flows:** Choose the right authentication mode for your use case—CI/CD, background jobs, or interactive CLI tools.
  - **Secure by default:** Tokens are encrypted and stored safely using `@azure/msal-node-extensions`.
  - **Consistent API:** Acquire tokens the same way across all your Node.js Fusion projects.

  **How to use:**

  1. Install the package in your Fusion Framework Node.js project.
  2. Enable the module and pick your authentication mode (`token_only`, `silent`, or `interactive`).
  3. Use the provided API to acquire tokens for Azure resources—no need to handle refresh logic or storage yourself.

  - Supports token_only, silent, and interactive authentication modes
  - Provides secure, encrypted token storage using `@azure/msal-node-extensions`
  - Integrates with Fusion Framework for seamless authentication
  - Includes comprehensive documentation and usage examples

  ## Example Setups

  ### `token_only` Mode

  ```ts
  import {
    enableAuthModule,
    type MsalNodeModule,
  } from "@equinor/fusion-framework-msal-node";
  import { ModulesConfigurator } from "@equinor/fusion-framework-module";

  const configurator = new ModulesConfigurator<[MsalNodeModule]>();

  enableAuthModule(configurator, (builder) => {
    builder.setMode("token_only");
    builder.setAccessToken("your-access-token"); // Provide your token
  });

  const instance = await initialize();
  console.log(
    await instance.auth.acquireAccessToken({ scopes: ["user.read"] })
  );
  ```

  ### `silent` Mode

  ```ts
  import {
    enableAuthModule,
    type MsalNodeModule,
  } from "@equinor/fusion-framework-msal-node";
  import { ModulesConfigurator } from "@equinor/fusion-framework-module";

  const configurator = new ModulesConfigurator<[MsalNodeModule]>();

  enableAuthModule(configurator, (builder) => {
    builder.setMode("silent");
    builder.setClientId("your-client-id");
    builder.setTenantId("your-tenant-id");
  });

  const instance = await initialize();
  console.log(
    await instance.auth.acquireAccessToken({ scopes: ["user.read"] })
  );
  ```

  ### `interactive` Mode

  ```ts
  import {
    enableAuthModule,
    type MsalNodeModule,
  } from "@equinor/fusion-framework-msal-node";
  import { ModulesConfigurator } from "@equinor/fusion-framework-module";

  const configurator = new ModulesConfigurator<[MsalNodeModule]>();

  enableAuthModule(configurator, (builder) => {
    builder.setMode("interactive");
    builder.setClientId("your-client-id");
    builder.setTenantId("your-tenant-id");
    builder.setServerPort(3000); // Local server port for auth callback
    builder.setServerOnOpen((url) => {
      console.log(`Please navigate to: ${url}`);
    });
  });

  const instance = await initialize();
  console.log(await instance.auth.login({ scopes: ["user.read"] }));
  ```

  See README.md for details.
