import { describe, it, expect } from 'vitest';
import { requireNodeProtocol } from '../require-node-protocol/index.js';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';

function lint(source: string): Diagnostic[] {
  return requireNodeProtocol.check(source, 'fixture.ts');
}

// ── Passing cases ─────────────────────────────────────────────────────────────

describe('require-node-protocol — passing', () => {
  it('passes: import already uses node: prefix', () => {
    expect(lint(`import { readFile } from 'node:fs/promises';`)).toHaveLength(0);
  });

  it('passes: path with node: prefix', () => {
    expect(lint(`import { join } from 'node:path';`)).toHaveLength(0);
  });

  it('passes: non-Node third-party import', () => {
    expect(lint(`import { something } from 'some-package';`)).toHaveLength(0);
  });

  it('passes: scoped package import', () => {
    expect(lint(`import { x } from '@equinor/fusion-framework-core';`)).toHaveLength(0);
  });

  it('passes: node: prefixed sub-path (fs/promises)', () => {
    expect(lint(`import { writeFile } from 'node:fs/promises';`)).toHaveLength(0);
  });

  it('passes: multiple node: prefixed imports', () => {
    const source = `
import { readFile } from 'node:fs';
import { join } from 'node:path';
import { EventEmitter } from 'node:events';
`;
    expect(lint(source)).toHaveLength(0);
  });
});

// ── Failing cases ─────────────────────────────────────────────────────────────

describe('require-node-protocol — failing', () => {
  it('fails: fs without node: prefix', () => {
    const diags = lint(`import { readFile } from 'fs';`);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain("'fs'");
    expect(diags[0].message).toContain("'node:fs'");
    expect(diags[0].rule).toBe('require-node-protocol');
  });

  it('fails: path without node: prefix', () => {
    const diags = lint(`import { join } from 'path';`);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain("'path'");
  });

  it('fails: url without node: prefix', () => {
    const diags = lint(`import { URL } from 'url';`);
    expect(diags).toHaveLength(1);
  });

  it('fails: crypto without node: prefix', () => {
    const diags = lint(`import { randomUUID } from 'crypto';`);
    expect(diags).toHaveLength(1);
  });

  it('fails: multiple bare Node imports each flagged once', () => {
    const source = `
import { readFile } from 'fs';
import { join } from 'path';
import { EventEmitter } from 'events';
`;
    expect(lint(source)).toHaveLength(3);
  });

  it('fails: default severity is error', () => {
    const diags = lint(`import fs from 'fs';`);
    expect(diags[0].severity).toBe('error');
  });
});
