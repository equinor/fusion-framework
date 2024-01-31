---
"@equinor/fusion-framework-react-module-context": minor
"@equinor/fusion-framework-module-context": minor
---

- Add FusionContextSearchError.
- Potential _BREAKING_:
  - Error in `ContextProvider.ts` are now unwrapped if the thrown error is
    `QueryClientError`.

```diff
index 114f430b1..2640c9a55 100644
--- a/packages/modules/context/src/ContextProvider.ts
+++ b/packages/modules/context/src/ContextProvider.ts
@@ -406,7 +407,15 @@ export class ContextProvider implements IContextProvider {
                 /* @ts-ignore */
                 this.#contextParameterFn({ search, type: this.#contextType }),
             )
-            .pipe(map((x) => x.value));
+            .pipe(
+                catchError((err) => {
+                    if (err.name === 'QueryClientError') {
+                        throw err.cause;
+                    }
+                    throw err;
+                }),
+                map((x) => x.value),
+            );

         return this.#contextFilter ? query$.pipe(map(this.#contextFilter)) : query$;
     }
```
