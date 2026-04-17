import { Button, Card, Typography } from '@equinor/eds-core-react';

import { getPortalAppHref } from '../utils/url';

/** Apps available for cross-app context-handoff testing. */
const SIBLING_APPS = [
  { key: 'meetings', label: 'Meetings' },
  { key: 'handover', label: 'Handover' },
  { key: 'app-admin', label: 'App Admin' },
  { key: 'key-project-data', label: 'Project' },
  { key: 'project-landingpage', label: 'Project Landingpage' },
  { key: 'ssu-sp', label: 'SSU-SP' },
] as const;

/** Props for {@link CrossAppSection}. */
interface CrossAppSectionProps {
  /** Callback that navigates to a sibling app by its route key. */
  navigateToApp: (appKey: string) => void;
}

/**
 * Card with buttons for navigating to sibling apps to test
 * cross-app context handoff.
 */
export function CrossAppSection({ navigateToApp }: CrossAppSectionProps) {
  return (
    <Card>
      <Card.Header>
        <Card.HeaderTitle>
          <Typography variant="h5">Cross-App Context Handoff</Typography>
          <Typography variant="body_short">
            Navigate to a sibling app. The portal should carry the active context over.
          </Typography>
        </Card.HeaderTitle>
      </Card.Header>
      <Card.Content>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {SIBLING_APPS.map(({ key, label }) => (
            <Button key={key} variant="outlined" onClick={() => navigateToApp(key)}>
              {label}
            </Button>
          ))}
        </div>
      </Card.Content>
      <Card.Actions meta="Fallback links (hard navigation)">
        {(['meetings', 'handover', 'key-project-data'] as const).map((key) => (
          <Button key={key} variant="ghost" as="a" href={getPortalAppHref(key)}>
            {key}
          </Button>
        ))}
      </Card.Actions>
    </Card>
  );
}
