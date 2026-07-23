import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeResult,
  TextDocumentSyncKind,
  DiagnosticSeverity,
  type Diagnostic,
} from 'vscode-languageserver/node.js';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { LintEngine } from '@equinor/fusion-framework-lint-core';
import {
  loadLintConfig,
  recommendedRules,
  recommendedConfig,
} from '@equinor/fusion-framework-lint-config';

// ── Connection + document manager ────────────────────────────────────────────

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

// ── Engine state ──────────────────────────────────────────────────────────────

/** Rebuilt whenever the workspace root or config file changes. */
let engine: LintEngine = new LintEngine(recommendedRules, recommendedConfig);

/** Controls when linting is triggered — updated from VS Code settings. */
let runOn: 'change' | 'save' = 'change';

/**
 * Loads (or reloads) the lint engine from the nearest `fusion-lint.config.*`
 * file in `cwd`.
 *
 * @param cwd - Directory to search for a config file.
 */
async function reloadEngine(cwd: string): Promise<void> {
  const loaded = await loadLintConfig({ cwd, base: recommendedConfig });
  // Combine built-in rules with any custom rules from the config file
  const rules = [...recommendedRules, ...(loaded?.customRules ?? [])];
  const config = loaded?.config ?? recommendedConfig;
  engine = new LintEngine(rules, config);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Converts a fusion-lint severity string to the LSP `DiagnosticSeverity` enum.
 *
 * @param severity - Fusion-lint severity string.
 * @returns The corresponding LSP severity number.
 */
function toLspSeverity(severity: string): DiagnosticSeverity {
  // Map fusion-lint severity names to LSP integer codes
  return severity === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning;
}

/**
 * Converts a 1-based line/col from a fusion-lint diagnostic to an LSP
 * zero-based range, extending to the end of the token at that position.
 *
 * For identifiers and keywords the range covers the full word.
 * For quoted strings the range covers from the opening to the closing quote.
 * Falls back to a single-character range when the character is not a word or
 * string delimiter.
 *
 * @param line     - 1-based line number.
 * @param col      - 1-based column number.
 * @param docText  - Full text of the document, used to scan the token end.
 * @returns An LSP `Range` object.
 */
function toRange(line: number, col: number, docText: string): Diagnostic['range'] {
  const zeroLine = line - 1;
  const zeroCol = col - 1;
  const lineText = docText.split('\n')[zeroLine] ?? '';
  const startChar = lineText[zeroCol] ?? '';
  let endCol = zeroCol;

  // Extend range to the closing quote for string literals
  if (startChar === "'" || startChar === '"' || startChar === '`') {
    endCol = zeroCol + 1;
    // Scan to the matching closing quote on the same line
    while (endCol < lineText.length && lineText[endCol] !== startChar) endCol++;
    // Include the closing quote itself
    if (endCol < lineText.length) endCol++;
  } else {
    // Extend to the end of the identifier / keyword (word characters)
    while (endCol < lineText.length && /\w/.test(lineText[endCol])) endCol++;
  }

  // Ensure a minimum span of one character
  if (endCol === zeroCol) endCol = zeroCol + 1;

  return {
    start: { line: zeroLine, character: zeroCol },
    end: { line: zeroLine, character: endCol },
  };
}

/**
 * Runs the lint engine over a document and publishes diagnostics to the client.
 *
 * @param document - The text document to lint.
 */
function lintDocument(document: TextDocument): void {
  // Only lint TypeScript source files
  if (!document.uri.endsWith('.ts') && !document.uri.endsWith('.tsx')) return;

  const results = engine.lint(document.getText(), document.uri);
  const text = document.getText();
  // Map each fusion-lint diagnostic to the LSP Diagnostic shape the client expects
  const diagnostics: Diagnostic[] = results.map((d) => ({
    range: toRange(d.line, d.col, text),
    severity: toLspSeverity(d.severity),
    code: d.rule,
    source: 'fusion-lint',
    // Use detail for the human-facing hover/Problems text when available;
    // fall back to the terse message for AI/JSON consumers
    message: d.detail ?? d.message,
  }));
  connection.sendDiagnostics({ uri: document.uri, diagnostics });
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

connection.onInitialize((params): InitializeResult => {
  // Derive workspace root from the first workspace folder, falling back to cwd
  const workspaceRoot =
    params.workspaceFolders?.[0]?.uri.replace('file://', '') ?? process.cwd();

  // Read the runOn preference sent by the client at startup
  const initRunOn = params.initializationOptions?.runOn;
  if (initRunOn === 'change' || initRunOn === 'save') runOn = initRunOn;

  // Load config asynchronously; engine defaults to recommended until ready
  reloadEngine(workspaceRoot).catch((err) => {
    connection.console.warn(`fusion-lint: failed to load config — ${String(err)}`);
  });

  return {
    capabilities: {
      textDocumentSync: {
        openClose: true,
        change: TextDocumentSyncKind.Incremental,
        // Required so the client sends didSave notifications
        save: true,
      },
    },
  };
});

connection.onDidChangeConfiguration((change) => {
  // The client sends the fusion-lint section when configurationSection is registered
  const settings = (change.settings as Record<string, unknown> | null)
    ?.["fusion-lint"] as Record<string, unknown> | undefined;
  const newRunOn = settings?.["runOn"];
  if (newRunOn === 'change' || newRunOn === 'save') runOn = newRunOn;
});

// ── Document events ───────────────────────────────────────────────────────────

documents.onDidOpen(({ document }) => {
  // Always lint on open so diagnostics appear immediately regardless of runOn mode
  lintDocument(document);
});

documents.onDidChangeContent(({ document }) => {
  if (runOn === 'change') lintDocument(document);
});

documents.onDidSave(({ document }) => {
  if (runOn === 'save') lintDocument(document);
});

documents.onDidClose(({ document }) => {
  // Clear diagnostics when a file is closed so stale errors disappear
  connection.sendDiagnostics({ uri: document.uri, diagnostics: [] });
});

// ── Start ─────────────────────────────────────────────────────────────────────

documents.listen(connection);
connection.listen();
