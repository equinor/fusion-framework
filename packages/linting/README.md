# 🔍 Fusion Lint

> **Fusion-specific lint rules for TypeScript — the stuff ESLint and Biome don't know about.**

Squiggles in your editor. Failures in CI. Inline comments on pull requests.  
All from one tool that understands how Fusion apps are supposed to be written.

---

## ✨ What makes it different

Most linters check _what_ your code does. Fusion Lint checks _why_.

Every `if`, `for`, and RxJS chain must be preceded by a comment explaining the intent. Every exported hook, component, and function must have TSDoc. The rules aren't pedantic — they're the conventions your team already agreed on, just enforced automatically.

---

## 🚀 Jump in

| I want to… | Go here |
|---|---|
| 🖥️ Get squiggles in VS Code right now | [vscode/ →](./vscode/) |
| ⌨️ Run lint in the terminal or pre-commit | [cli/ →](./cli/) |
| ⚙️ Wire it up in GitHub Actions | [cli/ → CI →](./cli/) |
| 📋 See every rule and what it catches | [rules/ →](./rules/) |
| 🎚️ Tune severities or turn rules off | [config/ →](./config/) |
| 🔧 Write your own rule | [core/ →](./core/) |

---

## 👀 See it in action

### Intent comments

```typescript
// ❌ Fusion Lint: require-intent-comment/flow
if (user.role === 'admin') {
  redirect('/admin');
}

// ✅ Why is obvious — lint is happy
// Admins land on a dedicated dashboard with elevated controls
if (user.role === 'admin') {
  redirect('/admin');
}
```

### TSDoc on public API

```typescript
// ❌ Fusion Lint: require-hook-tsdoc
export const useContextData = (id: string): ContextData => { ... };

// ✅ One line is enough
/** Fetches and caches context data for the given context ID. */
export const useContextData = (id: string): ContextData => { ... };
```

### Code style

```typescript
// ❌ Fusion Lint: no-class-components
export class UserCard extends React.Component<Props> { ... }

// ✅
export const UserCard = ({ user }: Props): JSX.Element => ( ... );
```

---

## 📦 Packages

```
core → rules → config → cli
                      → lsp → vscode
```

| Package | What it is |
|---|---|
| [`@equinor/fusion-framework-lint-core`](./core/) | Engine, `Rule` interface, `Diagnostic` type |
| [`@equinor/fusion-framework-lint-rules`](./rules/) | All built-in rules |
| [`@equinor/fusion-framework-lint-config`](./config/) | `recommended` preset and config loader |
| [`@equinor/fusion-lint`](./cli/) | CLI — `fusion-lint check` and `fusion-lint changed` |
| [`@equinor/fusion-framework-lint-lsp`](./lsp/) | LSP server for editor integration |
| [`fusion-lint-vscode`](./vscode/) | VS Code extension — squiggles, Problems panel, hover messages |
