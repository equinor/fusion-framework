If you discover a security vulnerability in this project, please follow these steps to responsibly disclose it:

1. **Do not** create a public GitHub issue for the vulnerability.
2. Follow our guideline for Responsible Disclosure Policy at [https://www.equinor.com/about-us/csirt](https://www.equinor.com/about-us/csirt) to report the issue

The following information will help us triage your report more quickly:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

We prefer all communications to be in English.

## Known Security Issues and Mitigations

### min-document Prototype Pollution Vulnerability

**Issue**: The `min-document` package (used by development dependencies) contains a prototype pollution vulnerability in its `removeAttributeNS`, `setAttributeNS`, `getAttributeNS`, and `hasAttributeNS` methods. This vulnerability allows attackers to manipulate JavaScript object prototype chains by passing `__proto__` or `constructor` as namespace parameters.

**Impact**: Low - This vulnerability only affects development environments since `min-document` is used by Storybook (via EDS Core React dev dependencies). Production builds are not affected.

**Status**: Mitigated locally with a security patch.

**Mitigation Applied**: A local patch has been applied to `min-document@2.19.0` that prevents access to dangerous prototype properties. The patch adds validation to reject operations on `__proto__`, `constructor`, and `prototype` namespace values.

**Files**:
- `patches/min-document@2.19.0.patch` - The security patch
- Applied to `node_modules/.pnpm/min-document@2.19.0/node_modules/min-document/dom-element.js`

**Recommendation**: Monitor for updates to `min-document` or consider replacing it with a maintained alternative if the dependency chain allows.