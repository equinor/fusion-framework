---
'@equinor/fusion-framework-legacy-interopt': patch
---

Fixed `createServiceResolver` to extract app client id from each services.
Previously we assumed that all services registered to the legacy auth container would use the same scope as all other services. This is not the case, as each service can have its own scope. This change allows us to extract the client id from the service definition, which is then used to create the service resolver.

Resources are indexed by the client id, so when acquiring a resource, the legacy auth container will use the client id to generate an auth token. This token is then used to authenticate the request to the resource.

**NOTE:** This will and should be deprecated in the future! This "bug" was discovered while an application used a mixed of legacy and new Framework, which caused the application to fail to authenticate requests to the resource (wrong audience).
