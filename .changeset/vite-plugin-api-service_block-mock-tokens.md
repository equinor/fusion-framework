---
"@equinor/fusion-framework-vite-plugin-api-service": patch
---

Never forward mock tokens to real services. Requests carrying an unsigned token (`alg: none`, as issued by mock authentication) to a public host are answered with `401` locally — on the service discovery proxy and on proxy routes — and never leave the machine. Local targets (`localhost`, `*.localhost`, Docker Compose service names, `*.local`, `*.internal`, private IPv4) are unaffected.
