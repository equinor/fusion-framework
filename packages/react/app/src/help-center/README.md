## Help center

### useHelpCenter

A hook to open the help center side sheet programmatically.

```typescript
const {
  openHelp,
  openArticle,
  openFaqs,
  openSearch,
  openGovernance
} = useHelpCenter();

openHelp();
openArticle('article-slug-name');
openFaqs();
openSearch('search-input');
openGovernance();
```
