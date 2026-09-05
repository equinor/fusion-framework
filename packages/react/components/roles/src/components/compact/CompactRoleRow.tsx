import type { ReactNode } from 'react';
import { Button, Icon, Typography } from '@equinor/eds-core-react';
import { info_circle } from '@equinor/eds-icons';
import styled from 'styled-components';
import type { RoleDetails } from '../overview/role-details';

Icon.add({ info_circle });

const Styled = {
  Row: styled.div`
    display: grid;
    grid-template-columns: 0.25rem minmax(0, 1fr) auto auto;
    gap: 0.75rem;
    align-items: center;
    min-height: 3.5rem;
    padding: 0.5rem;
  `,
  Indicator: styled.div<{ $active: boolean }>`
    align-self: stretch;
    background: ${({ $active }) => ($active ? '#007079' : '#dcdcdc')};
  `,
  Name: styled.div`
    min-width: 0;
  `,
  InfoButton: styled(Button)`
    min-width: 2.25rem;
    padding: 0.5rem;
  `,
};

/** Presentation shared by permanent, active, available, and expired compact assignments. */
interface CompactRoleRowProps {
  readonly role: RoleDetails;
  readonly caption: string;
  readonly onShowInformation: (details: RoleDetails) => void;
  readonly children?: ReactNode;
}

/**
 * Displays compact assignment identity and information access independently of mutation controls.
 * @param props - Role metadata, prepared caption, information callback, and optional control.
 * @returns A compact row with an activation indicator.
 */
export const CompactRoleRow = ({
  role,
  caption,
  onShowInformation,
  children,
}: CompactRoleRowProps): ReactNode => (
  <Styled.Row>
    <Styled.Indicator $active={role.isActive} />
    <Styled.Name>
      <Typography>{role.displayName}</Typography>
      <Typography variant="overline">{caption}</Typography>
    </Styled.Name>
    <Styled.InfoButton
      variant="ghost"
      aria-label={`Show information about ${role.displayName}`}
      onClick={() => onShowInformation(role)}
    >
      <Icon name="info_circle" />
    </Styled.InfoButton>
    {children}
  </Styled.Row>
);
