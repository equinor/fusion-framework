import {
  comment_chat,
  file_description,
  filter_alt,
  help_outline,
  list,
  search,
  type IconData,
} from '@equinor/eds-icons';

/** A production help page shown in the dev portal sidebar; all but Search and FAQs render "not supported". */
export interface HelpPageLink {
  /** Page id, matching the `page` of `@Portal::FusionHelp::open` where one exists. */
  readonly page: string;
  /** Sidebar label, matching the production Fusion Help sidebar. */
  readonly label: string;
  /** Sidebar icon. */
  readonly icon: IconData;
}

/**
 * Production Fusion Help sidebar pages, in production order. They keep the dev portal sidebar
 * shaped like production, so people and synthetic agents navigate the same structure. Locally,
 * only Search, FAQs, and the articles render content.
 */
export const HELP_PAGES: {
  /** Pages listed above the articles. */
  readonly top: readonly HelpPageLink[];
  /** Pages pinned to the bottom of the sidebar. */
  readonly bottom: readonly HelpPageLink[];
} = {
  top: [
    { page: 'search', label: 'Search', icon: search },
    { page: 'chatbot', label: 'Help Chatbot', icon: comment_chat },
    { page: 'app-description', label: 'App Description', icon: list },
    { page: 'faqs', label: 'Frequently Asked Questions', icon: help_outline },
    { page: 'release-notes', label: 'Release Notes', icon: file_description },
  ],
  bottom: [
    { page: 'governance', label: 'App Governance', icon: filter_alt },
    { page: 'contact-support', label: 'Contact Support', icon: help_outline },
  ],
};

export default HELP_PAGES;
