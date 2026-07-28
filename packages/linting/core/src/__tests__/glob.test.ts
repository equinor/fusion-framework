import { describe, it, expect } from 'vitest';
import { matchesBasenamePattern } from '../matches-basename-pattern.js';

describe('matchesBasenamePattern', () => {
  it('matches an exact basename with no wildcard', () => {
    expect(matchesBasenamePattern('/src/index.ts', ['index.ts'])).toBe(true);
  });

  it('does not match a differing exact basename', () => {
    expect(matchesBasenamePattern('/src/index.ts', ['barrel.ts'])).toBe(false);
  });

  it('matches a glob-style prefix wildcard pattern', () => {
    expect(matchesBasenamePattern('/src/bookmark.schemas.ts', ['*.schemas.ts'])).toBe(true);
  });

  it('matches a glob-style suffix wildcard pattern', () => {
    expect(matchesBasenamePattern('/src/bookmark-module.ts', ['*-module.ts'])).toBe(true);
  });

  it('does not match when no pattern applies', () => {
    expect(matchesBasenamePattern('/src/bookmark.schema.ts', ['*.schemas.ts'])).toBe(false);
  });

  it('matches when any of multiple patterns applies', () => {
    expect(matchesBasenamePattern('/src/static.ts', ['module.ts', 'static.ts'])).toBe(true);
  });
});
