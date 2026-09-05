import type { ReactNode } from 'react';
import { Card, Typography } from '@equinor/eds-core-react';
import styled from 'styled-components';

const Styled = {
  Card: styled(Card)`
    border: 1px solid rgb(0 0 0 / 20%);
    border-radius: 0.25rem;
    box-shadow: none;
  `,
};

/** Prepared assignment copy and optional claim control for the application layout. */
interface RoleAssignmentCardProps {
  readonly title: string;
  readonly description: string;
  readonly children?: ReactNode;
}

/**
 * Presents an active or claimable assignment without coupling card styling to provider state.
 * @param props - Assignment title, description, and optional activation control.
 * @returns An EDS assignment card.
 */
export const RoleAssignmentCard = ({
  title,
  description,
  children,
}: RoleAssignmentCardProps): ReactNode => (
  <Styled.Card>
    <Card.Header>
      <Card.HeaderTitle>
        <Typography variant="h4">{title}</Typography>
      </Card.HeaderTitle>
    </Card.Header>
    <Card.Content>
      <Typography>{description}</Typography>
    </Card.Content>
    {children ? <Card.Actions alignRight>{children}</Card.Actions> : null}
  </Styled.Card>
);
