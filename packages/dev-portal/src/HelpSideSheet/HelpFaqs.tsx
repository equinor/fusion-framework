import { useEffect, useId, useRef, useState, type ReactElement } from 'react';

import { Button, Icon, Typography } from '@equinor/eds-core-react';
import { chevron_down, chevron_up } from '@equinor/eds-icons';
import { styled } from 'styled-components';

import { HelpMarkdown } from './HelpMarkdown.js';
import type { HelpRequest } from './parse-help-request.js';
import type { HelpFaq } from './types.js';
import { useHelpFaqs } from './useHelpFaqs.js';

const Styled = {
  Section: styled.section`
    display: grid;
    gap: 0.75rem;
    align-content: start;
    padding: 0 0.5rem 1rem;
  `,
  List: styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid #dcdcdc;
  `,
  Item: styled.li`
    border-bottom: 1px solid #dcdcdc;
  `,
  Question: styled.button`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem 0.5rem;
    border: none;
    background: transparent;
    color: #007079;
    font: inherit;
    font-weight: 500;
    text-align: left;
    cursor: pointer;

    &:hover {
      background: #deedee;
    }
  `,
  Answer: styled.div`
    padding: 0 0.5rem 0.75rem;
    line-height: 1.5;
    overflow-wrap: anywhere;
  `,
};

/** Props for {@link FaqItem}. */
interface FaqItemProps {
  /** FAQ to render. */
  readonly faq: HelpFaq;
  /** Whether the answer is shown. */
  readonly expanded: boolean;
  /** Whether this FAQ was requested directly and should scroll into view. */
  readonly focused: boolean;
  /** Shows or hides the answer. */
  readonly onToggle: (slug: string) => void;
  /** Opens the linked article. */
  readonly onNavigate: (request: HelpRequest) => void;
}

/**
 * One FAQ as a disclosure: a question button controlling an answer region.
 *
 * @param props - {@link FaqItemProps}
 * @returns The FAQ list item.
 */
const FaqItem = ({ faq, expanded, focused, onToggle, onNavigate }: FaqItemProps): ReactElement => {
  const answerId = useId();
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    // A FAQ opened from search may be far down the list, so bring it into view once.
    if (focused) ref.current?.scrollIntoView({ block: 'nearest' });
  }, [focused]);

  return (
    <Styled.Item ref={ref} data-testid="help-faq" data-help-faq={faq.slug} data-expanded={expanded}>
      <Styled.Question
        type="button"
        aria-expanded={expanded}
        aria-controls={answerId}
        data-testid="help-faq-question"
        onClick={() => onToggle(faq.slug)}
      >
        <span>{faq.question}</span>
        <Icon data={expanded ? chevron_up : chevron_down} size={18} />
      </Styled.Question>
      {expanded && (
        <Styled.Answer
          id={answerId}
          role="region"
          aria-label={faq.question}
          data-testid="help-faq-answer"
        >
          <HelpMarkdown>{faq.answer ?? ''}</HelpMarkdown>
          {faq.linkedArticleIdentifier && (
            <Button
              variant="ghost"
              data-testid="help-faq-article-link"
              data-help-article={faq.linkedArticleIdentifier}
              onClick={() =>
                onNavigate({ page: 'article', articleId: faq.linkedArticleIdentifier ?? '' })
              }
            >
              Read the article
            </Button>
          )}
        </Styled.Answer>
      )}
    </Styled.Item>
  );
};

/** Props for {@link HelpFaqs}. */
interface HelpFaqsProps {
  /** The `faqs` page request; a new request refetches and may name a FAQ to expand. */
  readonly request: HelpRequest;
  /** Key of the current app, used to scope FAQs. */
  readonly appKey?: string;
  /** Opens a linked article. */
  readonly onNavigate: (request: HelpRequest) => void;
}

/**
 * Help panel FAQ page for `useHelpCenter().openFaqs()` and the sidebar's Frequently Asked
 * Questions entry: the current app's FAQs as expandable questions with markdown answers, each
 * linking to its article when the FAQ has `linkedArticle` frontmatter.
 *
 * Test ids: `help-faqs`, `help-faq` (with `data-help-faq` and `data-expanded`), `help-faq-question`,
 * `help-faq-answer`, `help-faq-article-link`, `help-faqs-loading`, `help-faqs-empty`,
 * `help-faqs-error`. Questions are buttons with `aria-expanded`; answers are regions named by
 * their question.
 *
 * @param props - {@link HelpFaqsProps}
 * @returns The FAQ page.
 *
 * @example
 * ```tsx
 * <HelpFaqs request={{ page: 'faqs', faqId: 'faq-access' }} appKey="my-app" onNavigate={navigate} />
 * ```
 */
export const HelpFaqs = ({ request, appKey, onNavigate }: HelpFaqsProps): ReactElement => {
  const state = useHelpFaqs(appKey, request);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    () => new Set(request.faqId ? [request.faqId] : []),
  );

  const toggle = (slug: string): void =>
    setExpanded((previous) => {
      const next = new Set(previous);
      // Each question toggles independently, so several answers can be compared side by side.
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  const status =
    state.status === 'idle' || state.status === 'loading' ? (
      <Typography data-testid="help-faqs-loading">Loading FAQs…</Typography>
    ) : state.status !== 'loaded' ? (
      <Typography data-testid="help-faqs-error">
        FAQs are not available.{' '}
        {state.status === 'error' || state.status === 'unavailable' ? state.message : ''}
      </Typography>
    ) : state.faqs.length === 0 ? (
      <Typography data-testid="help-faqs-empty">No FAQs for this app yet.</Typography>
    ) : undefined;

  return (
    <Styled.Section data-testid="help-faqs">
      <Typography variant="h3">Frequently Asked Questions</Typography>
      {status ?? (
        <Styled.List aria-label="Frequently asked questions">
          {/* One disclosure per FAQ, in sortOrder; the requested FAQ starts expanded. */}
          {state.status === 'loaded' &&
            state.faqs.map((faq) => (
              <FaqItem
                key={faq.slug}
                faq={faq}
                expanded={expanded.has(faq.slug)}
                focused={faq.slug === request.faqId}
                onToggle={toggle}
                onNavigate={onNavigate}
              />
            ))}
        </Styled.List>
      )}
    </Styled.Section>
  );
};

export default HelpFaqs;
