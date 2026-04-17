import { Card, Chip, Typography } from '@equinor/eds-core-react';

import type { RoutingDiagnostics } from '../hooks/useRoutingDiagnostics';

/** A single row in the diagnostics table. */
interface DiagRowProps {
  label: string;
  value: string;
  mono?: boolean;
}

/** Renders a label–value pair in a two-column grid. */
function DiagRow({ label, value, mono }: DiagRowProps) {
  return (
    <>
      <Typography variant="body_short" bold>
        {label}
      </Typography>
      <Typography
        variant="body_short"
        style={mono ? { fontFamily: 'monospace', fontSize: '0.8rem' } : undefined}
      >
        {value}
      </Typography>
    </>
  );
}

/** Props for {@link DiagnosticsDisplay}. */
interface DiagnosticsDisplayProps {
  /** Snapshot of routing diagnostics to render. */
  diagnostics: RoutingDiagnostics;
}

/**
 * Card that renders all routing diagnostics in a readable two-column
 * layout so developers can verify URL and context synchronisation.
 */
export function DiagnosticsDisplay({ diagnostics }: DiagnosticsDisplayProps) {
  return (
    <Card>
      <Card.Header>
        <Card.HeaderTitle>
          <Typography variant="h5">Diagnostics</Typography>
          <Typography variant="body_short">
            Raw routing state for debugging context synchronisation.
          </Typography>
        </Card.HeaderTitle>
      </Card.Header>
      <Card.Content>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '0.4rem 1rem',
            alignItems: 'center',
          }}
        >
          <Typography variant="body_short" bold>
            Strategy
          </Typography>
          <div>
            <Chip variant={diagnostics.strategy !== 'none' ? 'active' : 'default'}>
              {diagnostics.strategy}
            </Chip>
          </div>

          <DiagRow label="Pathname" value={diagnostics.pathname} mono />
          <DiagRow label="Search" value={diagnostics.search || '(empty)'} mono />

          <Typography variant="body_short" bold>
            Has $contextId
          </Typography>
          <div>
            <Chip variant={diagnostics.hasQueryContextId ? 'active' : 'error'}>
              {String(diagnostics.hasQueryContextId)}
            </Chip>
          </div>

          <DiagRow label="Init source" value={diagnostics.initSource} />
        </div>
      </Card.Content>
      <Card.Content>
        <Typography variant="overline" style={{ marginBottom: '0.25rem' }}>
          Current context (raw)
        </Typography>
        <pre
          style={{
            background: '#f5f5f5',
            padding: '0.75rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            overflow: 'auto',
            maxHeight: '12rem',
            margin: 0,
          }}
        >
          {JSON.stringify(diagnostics.currentContext, null, 2) ?? 'null'}
        </pre>
      </Card.Content>
    </Card>
  );
}
