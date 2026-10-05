import type { ReactElement } from 'react';

import { Button, Icon, Tooltip } from '@equinor/eds-core-react';
import { info_circle } from '@equinor/eds-icons';
import { useHelpCenter } from '@equinor/fusion-framework-react-app/help-center';

/** Props for {@link HelpInfoButton}. */
interface HelpInfoButtonProps {
  /** Slug of the help article to open, matching the article's `slug` frontmatter. */
  readonly articleSlug: string;
  /** What the article explains; used for the accessible name and tooltip. */
  readonly label: string;
}

/**
 * Info icon placed next to a heading that opens the matching help article in the portal's help
 * side sheet — the contextual-help pattern users know from the Fusion portal.
 *
 * It only dispatches `useHelpCenter().openArticle(slug)`; the portal decides how to show it. In
 * the dev portal the article comes from local docs served by `ffc mock-server`, so Playwright can
 * click `getByRole('button', { name: 'Help: …' })` and assert the article that opens.
 *
 * @param props - {@link HelpInfoButtonProps}
 * @returns An icon button with an accessible `Help: <label>` name.
 *
 * @example
 * ```tsx
 * <h2>
 *   Existing discovery service
 *   <HelpInfoButton articleSlug="existing-service-override" label="Existing service override" />
 * </h2>
 * ```
 */
export function HelpInfoButton({ articleSlug, label }: HelpInfoButtonProps): ReactElement {
  const helpCenter = useHelpCenter();
  const name = `Help: ${label}`;

  return (
    <Tooltip title={name}>
      <Button
        variant="ghost_icon"
        aria-label={name}
        data-help-article={articleSlug}
        onClick={() => helpCenter.openArticle(articleSlug)}
      >
        <Icon data={info_circle} />
      </Button>
    </Tooltip>
  );
}

export default HelpInfoButton;
