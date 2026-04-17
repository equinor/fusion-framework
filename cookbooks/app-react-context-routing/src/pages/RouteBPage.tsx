import { Card, Typography } from '@equinor/eds-core-react';

/**
 * Second child route used as the final verification step for
 * context-URL synchronisation.
 *
 * Also serves as the hard-navigation target (bypassing the in-app
 * router) to test that the app correctly re-initialises context
 * after a full page load.
 */
export default function RouteBPage() {
  return (
    <Card>
      <Card.Header>
        <Card.HeaderTitle>
          <Typography variant="h4">Route B</Typography>
          <Typography variant="body_short">
            Final verification route for context + URL synchronization behavior.
          </Typography>
        </Card.HeaderTitle>
      </Card.Header>
    </Card>
  );
}
