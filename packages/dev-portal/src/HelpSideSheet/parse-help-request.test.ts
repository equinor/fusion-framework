import { describe, expect, it } from 'vitest';

import { parseHelpRequest } from './parse-help-request';

describe('parseHelpRequest', () => {
  it('keeps an article request with its trimmed article id', () => {
    expect(parseHelpRequest({ page: 'article', articleId: ' getting-started ' })).toEqual({
      page: 'article',
      articleId: 'getting-started',
    });
  });

  it('keeps the query of a search request', () => {
    expect(parseHelpRequest({ page: 'search', search: ' roles ' })).toEqual({
      page: 'search',
      search: 'roles',
    });
    expect(parseHelpRequest({ page: 'search', search: 42 })).toEqual({ page: 'search' });
  });

  it('keeps other help pages by name', () => {
    expect(parseHelpRequest({ page: 'faqs' })).toEqual({ page: 'faqs' });
  });

  it('treats an article request without an id as unsupported', () => {
    expect(parseHelpRequest({ page: 'article', articleId: '' })).toEqual({
      page: 'article (missing article id)',
    });
  });

  it.each([undefined, null, 'article', {}, { page: 42 }])(
    'ignores a malformed detail (%j)',
    (detail) => {
      expect(parseHelpRequest(detail)).toBeUndefined();
    },
  );
});
