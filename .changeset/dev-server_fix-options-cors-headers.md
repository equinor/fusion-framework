---
"@equinor/fusion-framework-dev-server": patch
---

Fix OPTIONS requests missing Allow header after Vite 7 update

- Disabled Vite's internal CORS handling by setting `server.cors: false`
- This allows backend services to properly handle OPTIONS requests with correct headers
- Resolves issue where OPTIONS requests were not forwarded to backend after Vite 7 upgrade
- Backend services can now include Allow, Access-Control-Allow-Methods, and other CORS headers

closes: #3436
