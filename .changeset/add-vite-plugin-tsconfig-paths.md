---
"@equinor/fusion-framework-cli": minor
---

Add `vite-plugin-tsconfig-paths` to allow apps to use path aliases in tsconfig, instead of defining them manually in Vite config.

> [!NOTE]
> Newer versions of Vite wont resolve files from `baseUrl` in `tsconfig.json`.
>
> To fix this, you can either:
>
> - Update import with full relative path
> - Add paths to `tsconfig.json`

example:
```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
````
```typescript
import { MyComponent } from '@/components';
```

‼️ Bad practice:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "MyComponent": ["src/components/MyComponent"]
    }
  }
}
```
```typescript
import { MyComponent } from 'MyComponent';
```

> [!IMPORTANT]
> This is just best effort for resolving paths at build time. It does not guarantee that all paths will be resolved correctly in all scenarios. Please verify that your paths are working as expected after this update.

