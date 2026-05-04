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
function useHelpCenter(): HelpCenter;
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

## How It Works

Each method dispatches a `@Portal::FusionHelp::open` framework event with a `page` discriminator. The portal shell listens for this event and opens the corresponding help sidesheet page. The event module must be available in the app's module scope — this is the default when running inside a Fusion portal.
