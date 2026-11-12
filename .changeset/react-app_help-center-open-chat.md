---
"@equinor/fusion-framework-react-app": minor
---

Add `openChat(prompt?)` to `useHelpCenter`. It dispatches `@Portal::FusionHelp::open` with `{ page: 'chat', prompt }`, so an app can open the portal help chat with a prepared question that the user reviews before sending. The prompt is never submitted automatically.

`HelpCenterOpenEventDetail` now also includes the `release-notes` and `chat` pages.

Ref: equinor/fusion-core-tasks#2890.
