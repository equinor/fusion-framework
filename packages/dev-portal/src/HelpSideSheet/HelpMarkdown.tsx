import type { ReactElement } from 'react';

import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Opens links outside the portal, so following one never unloads the app under test. */
const markdownComponents: Components = {
  a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
};

/** Props for {@link HelpMarkdown}. */
interface HelpMarkdownProps {
  /** Markdown source of an article body or FAQ answer. */
  readonly children: string;
}

/**
 * Renders help markdown (GitHub-flavored: tables, task lists) as React elements. Raw HTML is not
 * rendered, so help content cannot inject markup into the portal.
 *
 * @param props - {@link HelpMarkdownProps}
 * @returns The rendered markdown.
 *
 * @example
 * ```tsx
 * <HelpMarkdown>{article.content ?? ''}</HelpMarkdown>
 * ```
 */
export const HelpMarkdown = ({ children }: HelpMarkdownProps): ReactElement => (
  <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
    {children}
  </Markdown>
);

export default HelpMarkdown;
