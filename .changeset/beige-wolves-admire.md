---
'@equinor/fusion-framework-cli': minor
---

person resolving

the CLI now resolves persons from `azureId` or `upn`

```tsx
const MyPage = () => {
  return (
    <fwc-person-avatar azureId='cbc6480d-12c1-467e-b0b8-cfbb22612daa'></fwc-person-avatar>
    <fwc-person-card azureId='cbc6480d-12c1-467e-b0b8-cfbb22612daa'></fwc-person-card>
    <fwc-person-list-item azureId='cbc6480d-12c1-467e-b0b8-cfbb22612daa'></fwc-person-list-item>
  )
}
```