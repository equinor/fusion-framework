---
"@equinor/fusion-framework-vite-plugin-spa": patch
"@equinor/fusion-framework-vite-plugin-api-service": patch
---

Add prepack script to run build before packaging

A `prepack` script was added to both the SPA and API service Vite plugin packages. This ensures the build step runs automatically before packaging, improving reliability of published artifacts.
