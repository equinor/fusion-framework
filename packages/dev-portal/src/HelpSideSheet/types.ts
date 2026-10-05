/** Article fields the dev portal renders, as returned by the Help API (or its local mock). */
export interface HelpArticle {
  /** Article UUID. */
  readonly id: string;
  /** Article slug, used to open and navigate to the article. */
  readonly slug: string;
  /** Article title. */
  readonly title: string;
  /** Short article summary. */
  readonly summary?: string;
  /** Ordering weight used for the sidebar. */
  readonly sortOrder?: number;
  /** Markdown article body; requested with `$expand=content`. */
  readonly content?: string;
  /** ISO timestamp of the last change, shown as "Last updated". */
  readonly lastModified?: string;
}

/** The Help API's paged-collection envelope for article lists. */
export interface HelpArticleCollection {
  /** Articles in this page. */
  readonly value?: readonly HelpArticle[];
}

/** FAQ fields the dev portal renders, as returned by the Help API (or its local mock). */
export interface HelpFaq {
  /** FAQ UUID. */
  readonly id: string;
  /** FAQ slug, used to expand the FAQ from a search hit. */
  readonly slug: string;
  /** The question. */
  readonly question: string;
  /** Markdown answer. */
  readonly answer?: string;
  /** Ordering weight. */
  readonly sortOrder?: number;
  /** Slug of the article that explains the answer in depth. */
  readonly linkedArticleIdentifier?: string;
}

/** The Help API's paged-collection envelope for FAQ lists. */
export interface HelpFaqCollection {
  /** FAQs in this page. */
  readonly value?: readonly HelpFaq[];
}
