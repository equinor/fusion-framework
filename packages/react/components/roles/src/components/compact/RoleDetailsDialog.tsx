import type { ReactNode } from 'react';
import { Button, Dialog, Icon, Typography } from '@equinor/eds-core-react';
import { info_circle } from '@equinor/eds-icons';
import styled from 'styled-components';
import type { RoleDetails } from '../overview/role-details';
import { formatRoleDetails } from './format-role-details';

Icon.add({ info_circle });

const Styled = {
  Dialog: styled(Dialog)`
    width: 26rem;
    max-width: calc(100vw - 2rem);
  `,
  Title: styled.span`
    display: flex;
    gap: 0.75rem;
    align-items: center;
  `,
  Details: styled.div`
    display: grid;
    gap: 1.25rem;
  `,
  Detail: styled.div`
    display: grid;
    gap: 0.25rem;
  `,
};

/** Selected role information and dismissal callback. */
interface RoleDetailsDialogProps {
  readonly role: RoleDetails;
  readonly onClose: VoidFunction;
}

/**
 * Explains entitlement reasons, scope, validity, and activation without expanding compact rows.
 * @param props - Selected assignment and dismissal callback.
 * @returns An informational EDS dialog.
 */
export const RoleDetailsDialog = ({ role, onClose }: RoleDetailsDialogProps): ReactNode => {
  const labels = formatRoleDetails(role, Date.now());
  // Consolidated assignments can carry several independent entitlement reasons.
  const reasons = role.reasons.map((reason) => <Typography key={reason}>{reason}</Typography>);
  return (
    <Styled.Dialog open>
      <Dialog.Header>
        <Styled.Title>
          <Icon name="info_circle" />
          {role.displayName}
        </Styled.Title>
      </Dialog.Header>
      <Dialog.Content>
        <Styled.Details>
          <Typography>{role.description}</Typography>
          <Styled.Detail>
            <Typography group="heading" variant="h6">
              Reason you have this role
            </Typography>
            {reasons.length > 0 ? reasons : <Typography>No assignment reason provided</Typography>}
          </Styled.Detail>
          <Styled.Detail>
            <Typography group="heading" variant="h6">
              Valid until
            </Typography>
            <Typography>{labels.validUntil}</Typography>
          </Styled.Detail>
          <Styled.Detail>
            <Typography group="heading" variant="h6">
              Scope
            </Typography>
            <Typography>{labels.scope}</Typography>
          </Styled.Detail>
          <Styled.Detail>
            <Typography group="heading" variant="h6">
              Activation
            </Typography>
            <Typography>{labels.activation}</Typography>
          </Styled.Detail>
        </Styled.Details>
      </Dialog.Content>
      <Dialog.Actions>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </Dialog.Actions>
    </Styled.Dialog>
  );
};
