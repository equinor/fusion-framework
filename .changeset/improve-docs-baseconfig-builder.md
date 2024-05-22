---
"@equinor/fusion-framework": patch
---

## @equinor/fusion-framework

### Improved documentation for `BaseConfigBuilder`

The `BaseConfigBuilder` class has been updated with improved documentation to better explain its usage and capabilities.

#### What changed?

The `BaseConfigBuilder` class is an abstract class that provides a flexible and extensible way to build and configure modules. It allows you to define configuration callbacks for different parts of your module's configuration, and then combine and process these callbacks to generate the final configuration object.

The documentation has been expanded to include:

1. A detailed explanation of how the `BaseConfigBuilder` class is designed to be used, including an example of creating a configuration builder for a hypothetical `MyModule` module.
2. Descriptions of the key methods and properties provided by the `BaseConfigBuilder` class, such as `createConfig`, `createConfigAsync`, `_set`, `_buildConfig`, and `_processConfig`.
3. Guidance on how to override the `_processConfig` method to add additional logic or validation to the configuration object before it is returned.
4. Examples of how to use the `BaseConfigBuilder` class to handle common configuration scenarios, such as setting default values or validating configuration properties.
