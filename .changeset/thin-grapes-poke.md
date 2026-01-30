---
"@equinor/fusion-framework-module-service-discovery": minor
"@equinor/fusion-framework-app": minor
---

Add support for session overridden service discovery endpoints

Checks `overriddenServiceDiscoveryUrls` in session storage.

The serviceName is looked up in ServiceDiscovery.
User can override url and scopes with session values.
App can override url and scopes with app config.

Priority:

1. Session overrides
2. AppConfig
3. ServiceDiscovery
