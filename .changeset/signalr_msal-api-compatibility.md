---
"@equinor/fusion-framework-module-signalr": patch
---

Update SignalR module to use new MSAL token acquisition API format.

Internal implementation change to adapt to MSAL interface updates. SignalR module continues to work the same way for consumers.

Why: Ensures compatibility with updated MSAL module API.
