# Help Center

Open the Fusion portal help sidesheet programmatically from your app using the `useHelpCenter` hook.

**Import:**

```ts
import { useHelpCenter } from '@equinor/fusion-framework-react-app/help-center';
```

> [!NOTE]
> This hook dispatches a framework event to the portal shell. The help module must be enabled by the host — your app does not configure it directly.

## useHelpCenter

Returns an object with methods for opening specific pages of the portal help sidesheet.

**Signature:**

```ts
useHelpCenter(): HelpCenter;
```

**Returned methods:**

| Method                          | Description                                         |
| ------------------------------- | --------------------------------------------------- |
| `openHelp()`                    | Opens the help sidesheet on the home page           |
| `openArticle(articleId: string)` | Opens a specific help article by its slug or ID    |
| `openFaqs()`                    | Opens the FAQs page                                 |
| `openSearch(search: string)`    | Opens the search page with a pre-filled query       |
| `openGovernance()`              | Opens the governance tab                            |
| `openReleaseNotes()`            | Opens the release notes page                        |
| `openChat(prompt?: string)`     | Opens the help chat with an optional pre-filled prompt |

## Examples

### Open a Specific Article from a Button

```tsx
import { useHelpCenter } from '@equinor/fusion-framework-react-app/help-center';

const HelpButton = () => {
  const { openArticle } = useHelpCenter();

  return (
    <button onClick={() => openArticle('getting-started')}>
      How to get started
    </button>
  );
};
```

### Open Help Home

```tsx
import { useHelpCenter } from '@equinor/fusion-framework-react-app/help-center';

const HelpLink = () => {
  const { openHelp } = useHelpCenter();
  return <button onClick={openHelp}>Help</button>;
};
```

### Search Help Content

```tsx
import { useHelpCenter } from '@equinor/fusion-framework-react-app/help-center';

const SearchHelp = ({ query }: { query: string }) => {
  const { openSearch } = useHelpCenter();
  return <button onClick={() => openSearch(query)}>Search help</button>;
};
```

### Ask the Help Chat with a Prepared Prompt

`openChat(prompt)` opens the help chat and places the prompt in the chat input. The user reviews and edits the text, then sends it. The prompt is never sent automatically, and an existing conversation is kept.

```tsx
import { useHelpCenter } from '@equinor/fusion-framework-react-app/help-center';

const AskForAccessHelp = () => {
  const { openChat } = useHelpCenter();

  return (
    <button
      onClick={() =>
        openChat(
          'I need access to a CQC finding. I get the message "No findings or observations are available to you". The project is not associated with an org chart.',
        )
      }
    >
      Ask AI for help
    </button>
  );
};
```

> [!IMPORTANT]
> The prompt is untrusted user text, not an instruction to the assistant, and it does not change what the user can access. Keep it short and include only what the user needs to ask the question. Do not include tokens, personal data, or confidential content. The portal trims the prompt, ignores empty or non-string values, and shortens prompts longer than 2000 characters.

If the portal has the floating Fusion Chatbot enabled, the prompt opens there; otherwise it opens on the chat page of the help sidesheet.

## How It Works

Each method dispatches a `@Portal::FusionHelp::open` framework event with a `page` discriminator. The portal shell listens for this event and opens the corresponding help sidesheet page. The event module must be available in the app's module scope — this is the default when running inside a Fusion portal.

The known `page` values and their additional fields are:

| `page` value      | Extra fields                  | Opened by          |
| ----------------- | ----------------------------- | ------------------ |
| `home`            | —                             | `openHelp()`       |
| `article`         | `articleId: string`           | `openArticle(id)`  |
| `faqs`            | —                             | `openFaqs()`       |
| `search`          | `search: string`              | `openSearch(q)`    |
| `governance`      | —                             | `openGovernance()` |
| `release-notes`   | —                             | `openReleaseNotes()` |
| `chat`            | `prompt?: string`             | `openChat(prompt)` |
