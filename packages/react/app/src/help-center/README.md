## Help center

### useHelpCenter

A hook to open the help center side sheet programmatically.

```typescript
const {
  openHelp,
  openArticle,
  openFaqs,
  openSearch,
  openGovernance,
  openReleaseNotes,
  openChat
} = useHelpCenter();

openHelp();
openArticle('article-slug-name');
openFaqs();
openSearch('search-input');
openGovernance();
openReleaseNotes();
openChat('prompt the user can review before sending');
```
