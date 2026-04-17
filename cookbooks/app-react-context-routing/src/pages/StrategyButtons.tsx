import { Button, Card, Chip, Divider, Icon, Typography } from '@equinor/eds-core-react';
import { link, delete_to_trash } from '@equinor/eds-icons';

import type { ContextMode } from '../utils/strategy';

/** Strategy options shown as chips. */
const STRATEGIES: { value: ContextMode; label: string }[] = [
  { value: 'query', label: 'Query' },
  { value: 'path', label: 'Path' },
  { value: 'custom', label: 'Custom' },
  { value: 'none', label: 'None (legacy)' },
];

/** Props for {@link StrategyButtons}. */
interface StrategyButtonsProps {
  /** The currently active routing strategy label. */
  activeStrategy: string;
  /** Callback when the developer picks a different strategy. */
  onStrategyChange: (strategy: ContextMode) => void;
  /** Absolute href for a full-page navigation to Route B. */
  hardNavigateHref: string;
  /** Callback that strips all context references from the URL. */
  onRemoveContext: () => void;
}

/**
 * Card with chip-based strategy selector and quick-action buttons
 * for hard navigation and context removal.
 */
export function StrategyButtons({
  activeStrategy,
  onStrategyChange,
  hardNavigateHref,
  onRemoveContext,
}: StrategyButtonsProps) {
  return (
    <Card elevation="raised">
      <Card.Header>
        <Card.HeaderTitle>
          <Typography variant="h5">Routing Strategy</Typography>
          <Typography variant="body_short">
            Switch strategy to move the context id between URL positions.
          </Typography>
        </Card.HeaderTitle>
      </Card.Header>
      <Card.Content>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {STRATEGIES.map(({ value, label }) => (
            <Chip
              key={value}
              variant={activeStrategy === value ? 'active' : 'default'}
              onClick={() => onStrategyChange(value)}
            >
              {label}
            </Chip>
          ))}
        </div>
      </Card.Content>
      <Divider style={{ width: '100%' }} variant="small" />
      <Card.Actions>
        <Button variant="outlined" as="a" href={hardNavigateHref}>
          <Icon data={link} size={16} />
          Hard Navigate to Route B
        </Button>
        <Button variant="outlined" color="danger" onClick={onRemoveContext}>
          <Icon data={delete_to_trash} size={16} />
          Remove Context from URL
        </Button>
      </Card.Actions>
    </Card>
  );
}
