---
'@equinor/fusion-framework-cli': minor
---

Created a plugin for handling application settings. This plugin allows retrieving and setting application settings when developing locally by intercepting the request to the settings API and returning the local settings instead. Settings are stored in memory and are not persisted, which means the CLI will always provide settings as if the user has never set them before. By restarting the CLI, the settings will be lost. This plugin is useful for testing and development purposes.

Also added a utility function `parseJsonFromRequest` to parse JSON from a request body. This function is used in the plugin to parse the `PUT` request body and update the settings accordingly.

The default development server has enabled this plugin by default and confiuigred it to intercept the settings API on `/apps-proxy/persons/me/apps/${CURRENT_APP_KEY}/settings`
