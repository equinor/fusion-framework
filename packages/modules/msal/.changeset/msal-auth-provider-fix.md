---
"@equinor/fusion-framework-module-msal": patch
---

Fixed AuthProvider to properly extend BaseModuleProvider, eliminating module initialization warnings about provider inheritance.

The AuthProvider class now inherits the standard version property and dispose method from BaseModuleProvider, ensuring proper integration with the Fusion Framework's module system.
