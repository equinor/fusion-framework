---
"@equinor/fusion-framework-cli": major
---

The CLI has been rewritten to use Fusion Framework internally to minimize dependencies and improve performance. This change allows the CLI to be more efficient and maintainable. It also means that the CLI is now a first-class citizen in the Fusion Framework ecosystem, providing a more consistent and integrated experience.

The dev portal has been moved out to a separate package `@equinor/fusion-framework-dev-server`. This separation allows for a more modular architecture, enabling developers to use the dev portal independently of the CLI. It also facilitates easier updates and maintenance of the dev portal without affecting the CLI functionality. It also allows for 3rd party developers to create their own dev portals using the Fusion Framework. Also, moving the dev portal to a separate package allows for better versioning and dependency management, ensuring that developers can always use the latest features and improvements without being tied to the CLI release cycle.

The dev portal can be configured using the `dev-server.config.js` file, which allows developers to customize the behavior and appearance of the dev portal. This configuration file provides flexibility in how the dev portal operates, enabling developers to tailor it to their specific needs and preferences. **this is currently not documented, but will be in the future**

Since the dev portal uses the plugin `@equinor/fusion-framework-vite-plugin-spa`, it is possible to specify a live portal to preview the application in the dev portal. This feature allows developers to see their changes in real-time, enhancing the development experience and speeding up the feedback loop. It is particularly useful for testing and debugging applications during development.

The dev portal also supports mocking API services, which allows developers to simulate backend services without needing a live server. This feature is particularly useful for testing and development, as it enables developers to work on the frontend independently of the backend, ensuring a smoother development process. **this is currently not documented, but will be in the future**

The dev portal is a key component of the Fusion Framework ecosystem, providing a user-friendly interface for developers to interact with their applications. It allows developers to easily manage and test their applications, providing a streamlined development experience.

The Dev Portal uses by default the `@equinor/fusion-framework-dev-portal` package, which is the official dev portal package provided by Fusion which is developer-friendly portal for developing and testing Fusion Framework applications. But it is possible to specify any package as a dev portal, allowing for customization of the development experience. This flexibility enables developers to create their own dev portals or use third-party solutions that better fit their needs.

The CLI now supports the `fusion-framework-cli auth login` command for authentication, which is a more secure and user-friendly way to manage access to Fusion Framework applications. This command simplifies the authentication process, making it easier for developers to log in and start working on their applications without needing to manually set environment variables or manage tokens. _`FUSION_TOKEN`_ is still supported for CI/CD and automation, but the CLI now provides a more streamlined and intuitive way to handle authentication.

The CLI has now been divided into three main groups:

- **bin**: This namespace contains executable functions that can be executed from node scripts, handy for automation and scripting or creating a custom CLI.
- **commands**: This namespace contains commands that can be executed from the CLI, providing a user-friendly interface for developers to interact with the Fusion Framework.
- **lib**: This namespace is reserved for consumers of the CLI, like defining configuration files, exposing interfaces, and other utilities that can be used in custom scripts or applications. This separation allows for better organization and modularity of the CLI codebase, making it easier to maintain and extend.

**BREAKING CHANGES:**

the `--service` flag has been removed since the CLI now uses the Fusion Framework internally, which does not require this flag, but uses service discovery to resolve endpoints automatically according to provided Fusion environment variables. This change simplifies the CLI usage and aligns it more closely with the Fusion Framework's architecture, allowing for a more seamless integration and improved developer experience.

All `app -build-???` has alias to correct commands, but been flagged as deprecated and will be removed in the next major version. 
