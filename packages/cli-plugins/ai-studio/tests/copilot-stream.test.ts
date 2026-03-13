import { describe, expect, it } from 'vitest';
import {
  detectTaskStage,
  parseOperationLine,
  sanitizeCopilotOutputLine,
  tokenize,
} from '../src/copilot-stream.js';

describe('parseOperationLine', () => {
  it('parses list directory operation', () => {
    const parsed = parseOperationLine('List directory packages/dev-portal/src');

    expect(parsed).toMatchObject({
      operation: 'list',
      kind: 'info',
      target: 'packages/dev-portal/src',
    });
  });

  it('parses edit operation with failed marker and diff counts', () => {
    const parsed = parseOperationLine('✗ Edit packages/dev-portal/src/App.tsx (+5 -2)');

    expect(parsed).toMatchObject({
      operation: 'edit',
      kind: 'error',
      target: 'packages/dev-portal/src/App.tsx',
      additions: 5,
      deletions: 2,
    });
  });

  it('parses detail marker lines', () => {
    const parsed = parseOperationLine('└ no matches found in selected files');

    expect(parsed).toMatchObject({
      operation: 'detail',
      message: 'no matches found in selected files',
    });
  });

  it('returns null for narrative output', () => {
    expect(parseOperationLine('Implemented the requested fix in the chat panel.')).toBeNull();
  });
});

describe('detectTaskStage', () => {
  it('detects reasoning stage', () => {
    expect(detectTaskStage('Thinking through the safest change')).toBe('reasoning');
  });

  it('detects applying stage', () => {
    expect(detectTaskStage('Applying edits to source files')).toBe('applying');
  });
});

describe('sanitizeCopilotOutputLine', () => {
  it('drops known noise lines', () => {
    expect(sanitizeCopilotOutputLine('summary:')).toBe('');
    expect(sanitizeCopilotOutputLine('undefined')).toBe('');
  });
});

describe('tokenize', () => {
  it('keeps whitespace chunks for fluent stream rendering', () => {
    expect(tokenize('a b')).toEqual(['a', ' ', 'b']);
  });
});
