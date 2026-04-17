import { Card, Typography } from '@equinor/eds-core-react';

/**
 * Landing page for the context-routing cookbook.
 *
 * Acts as the baseline route where developers first select a context
 * and confirm that the URL reflects the active routing strategy before
 * navigating to child routes.
 */
export default function HomePage() {
  return (
    <Card>
      <Card.Header>
        <Card.HeaderTitle>
          <Typography variant="h4">Home</Typography>
          <Typography variant="body_short">
            Baseline route. Select a context, confirm <code>$contextId</code> appears in query mode,
            then navigate to other routes.
          </Typography>
        </Card.HeaderTitle>
      </Card.Header>
    </Card>
  );
}
