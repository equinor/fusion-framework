import { Card, Typography } from '@equinor/eds-core-react';

/**
 * First child route for verifying that context stays synchronised
 * across in-app navigations.
 *
 * After selecting a context on the home page, navigating here should
 * keep the context id in its strategy-specific URL position.
 */
export default function RouteAPage() {
  return (
    <Card>
      <Card.Header>
        <Card.HeaderTitle>
          <Typography variant="h4">Route A</Typography>
          <Typography variant="body_short">
            Verify that route navigation keeps URL search so <code>$contextId</code> stays present.
          </Typography>
        </Card.HeaderTitle>
      </Card.Header>
    </Card>
  );
}
