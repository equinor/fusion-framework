---
"@equinor/fusion-framework-cli": minor
---

**Portal Tags Now Support Any String Value**

Portal tagging functionality has been enhanced to accept any string value for tags instead of being restricted to predefined enum values.

**Breaking Changes**

- **Removed `AllowedPortalTags` enum**: The enum that previously restricted portal tags to only `'latest'` and `'preview'` has been removed.
- **No longer exported**: `AllowedPortalTags` is no longer exported from `@equinor/fusion-framework-cli/bin`.

**Migration**

If you were importing and using `AllowedPortalTags`:

```typescript
// Before
import { AllowedPortalTags } from '@equinor/fusion-framework-cli/bin';
await tagPortal({ tag: AllowedPortalTags.Latest, ... });

// After  
await tagPortal({ tag: 'latest', ... });
```

**New Flexibility**

You can now use any string value for portal tags:

```bash
# Common tags still work
ffc portal publish --tag latest
ffc portal publish --tag preview

# New flexibility with custom tags
ffc portal publish --tag next
ffc portal publish --tag stable
ffc portal publish --tag v2.0.0-beta
ffc portal publish --tag release-candidate
ffc portal tag custom-environment --package my-portal@1.0.0
```

**Enhanced Documentation**

- Updated CLI help text with practical examples
- Added common tag examples (`latest`, `preview`, `next`, `stable`) in documentation
- Maintained guidance while showing flexibility

**Validation**

- Tags must be non-empty strings
- No other restrictions on tag format or content
- Backward compatibility maintained for existing tag values

This change provides much greater flexibility for deployment workflows while maintaining the same API structure and functionality.