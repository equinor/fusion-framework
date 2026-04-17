import { Card, Icon, Typography } from '@equinor/eds-core-react';
import { info_circle } from '@equinor/eds-icons';
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context';

/**
 * Card that displays a compact summary of the active context: title, type, and id.
 *
 * Renders an informational "No context selected" card when nothing is active,
 * giving immediate visual feedback on every route.
 */
export function ContextSummary() {
  const { currentContext } = useModuleCurrentContext();

  if (!currentContext) {
    return (
      <Card variant="info">
        <Card.Header>
          <Icon data={info_circle} size={24} />
          <Card.HeaderTitle>
            <Typography variant="h6">No context selected</Typography>
            <Typography variant="body_short">
              Select a context in the portal to see it reflected here.
            </Typography>
          </Card.HeaderTitle>
        </Card.Header>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Card.HeaderTitle>
          <Typography variant="overline">Active Context</Typography>
          <Typography variant="h5">{currentContext.title ?? '—'}</Typography>
        </Card.HeaderTitle>
      </Card.Header>
      <Card.Content>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.25rem 1rem' }}>
          <Typography variant="body_short" bold>
            Type
          </Typography>
          <Typography variant="body_short">{currentContext.type?.id ?? '—'}</Typography>
          <Typography variant="body_short" bold>
            ID
          </Typography>
          <Typography variant="body_short" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
            {currentContext.id}
          </Typography>
        </div>
      </Card.Content>
    </Card>
  );
}
