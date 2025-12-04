---
"@equinor/fusion-framework-react-app": major
"@equinor/fusion-framework-react": major
"@equinor/fusion-framework-react-router": major
"@equinor/fusion-framework-react-module": major
"@equinor/fusion-framework-react-module-http": major
"@equinor/fusion-framework-react-module-context": major
"@equinor/fusion-framework-react-module-event": major
"@equinor/fusion-framework-react-module-bookmark": major
"@equinor/fusion-framework-react-module-signalr": major
"@equinor/fusion-framework-react-components-bookmark": major
"@equinor/fusion-framework-react-components-people-provider": major
"@equinor/fusion-observable": major
"@equinor/fusion-query": major
"@equinor/fusion-framework-dev-portal": major
---

Upgrade to React 19 and remove support for React versions lower than 18.

**Breaking changes:**
- Peer dependencies now require React 18 or 19 (`^18.0.0 || ^19.0.0`)
- React 16 and 17 are no longer supported
- Dev dependencies upgraded to React 19.2.1 and @types/react 19.2.7

**Migration:**
- Update your React version to 18.0.0 or higher before upgrading these packages
- If using React 16 or 17, upgrade to React 18 or 19 first
