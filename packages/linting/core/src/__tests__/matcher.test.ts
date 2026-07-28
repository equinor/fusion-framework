import { describe, it, expect } from 'vitest';
import { createMatcher } from '../matcher.js';

describe('createMatcher', () => {
  it('with no arguments, matches every file', () => {
    const matcherFn = createMatcher();
    expect(matcherFn('/src/anything.ts')).toBe(true);
  });

  it('exclude-only: returns false (skip) when the basename matches an exclude pattern', () => {
    const matcherFn = createMatcher([], ['index.ts', '*.schemas.ts']);
    expect(matcherFn('/src/index.ts')).toBe(false);
    expect(matcherFn('/src/bookmark.schemas.ts')).toBe(false);
  });

  it('exclude-only: returns true (run) when the basename matches no exclude pattern', () => {
    const matcherFn = createMatcher([], ['index.ts', '*.schemas.ts']);
    expect(matcherFn('/src/user.ts')).toBe(true);
  });

  it('include-only: returns true (run) when the basename matches an include pattern', () => {
    const matcherFn = createMatcher(['*.tsx', '*.jsx']);
    expect(matcherFn('/src/Component.tsx')).toBe(true);
    expect(matcherFn('/src/Component.jsx')).toBe(true);
  });

  it('include-only: returns false (skip) when the basename matches no include pattern', () => {
    const matcherFn = createMatcher(['*.tsx']);
    expect(matcherFn('/src/util.ts')).toBe(false);
  });

  it('exclusions take precedence over inclusions', () => {
    const matcherFn = createMatcher(['*.ts'], ['*.schemas.ts']);
    expect(matcherFn('/src/bookmark.schemas.ts')).toBe(false);
    expect(matcherFn('/src/bookmark.ts')).toBe(true);
  });

  it('exclusions win even against a maximally wide include pattern', () => {
    const matcherFn = createMatcher(['*'], ['index.ts']);
    expect(matcherFn('/src/index.ts')).toBe(false);
    expect(matcherFn('/src/user.ts')).toBe(true);
  });
});
