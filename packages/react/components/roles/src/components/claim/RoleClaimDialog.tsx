import type { ChangeEvent, ReactNode } from 'react';

import { Button, Dialog, Slider, Textarea, Typography } from '@equinor/eds-core-react';
import styled from 'styled-components';
import { useRoleClaimForm, type RoleClaimFormOptions } from './useRoleClaimForm';

const Styled = {
  Dialog: styled(Dialog)`
    width: 32rem;
    max-width: calc(100vw - 2rem);
  `,
  Content: styled(Dialog.Content)`
  display: grid;
  gap: 1rem;
`,

  SectionDivider: styled.hr`
  width: 100%;
  margin: 0;
  border: 0;
  border-top: 1px solid rgb(0 0 0 / 20%);
`,

  DurationField: styled.div`
  display: grid;
  gap: 0.75rem;
  padding: 0 0.5rem;
`,

  SelectedDuration: styled(Typography)`
  justify-self: end;
  margin-top: 0.75rem;
  color: rgb(0 0 0 / 60%);
  font-size: 0.875rem;
`,
};

/** Audit form inputs with an explicit dialog dismissal callback. */
interface RoleClaimDialogProps extends RoleClaimFormOptions {
  readonly onClose: VoidFunction;
}

/**
 * Collects the audit reason and activation duration before claiming a role.
 *
 * Owns submission failures for all claim entry points, including in-place expiry recovery.
 * Callbacks must reject on failure; only their successful path may close or retry the host.
 *
 * @param props - Selected claim, pending state, and dialog callbacks.
 * @returns An EDS dialog when a claimable role has been selected.
 */
export const RoleClaimDialog = ({
  claim,
  defaultReason,
  isClaiming,
  onClose,
  onClaim,
}: RoleClaimDialogProps): ReactNode => {
  const form = useRoleClaimForm({ claim, defaultReason, isClaiming, onClaim });
  const { reason, durationHours, isPending, claimError } = form;

  // Keep the dialog out of the accessibility tree until the user selects an assignment.
  if (!claim) {
    return null;
  }

  return (
    <Styled.Dialog open>
      <Dialog.Header>Claim {claim.displayName}</Dialog.Header>
      <Styled.Content>
        <Typography>
          Choose how long the role should remain active and provide a reason for the activation.
        </Typography>
        {claimError ? <p role="alert">{claimError}</p> : null}
        <Textarea
          label="Reason"
          helperText="This reason is recorded in the role activation audit log."
          required
          rows={3}
          value={reason}
          disabled={isPending}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => form.setReason(event.target.value)}
        />
        <Styled.SectionDivider />
        <Styled.DurationField>
          <Typography variant="body_short">
            Select an activation duration from 1 to 8 hours.
          </Typography>
          <Slider
            aria-label="Duration in hours"
            value={durationHours}
            min={1}
            max={8}
            step={1}
            minMaxValues
            disabled={isPending}
            onChange={(_event, value) => form.setDurationHours(value[0])}
          />
          <Styled.SelectedDuration variant="body_short">
            Duration: {durationHours} hours
          </Styled.SelectedDuration>
        </Styled.DurationField>
      </Styled.Content>
      <Dialog.Actions>
        <Button variant="ghost" disabled={isPending} onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!form.canSubmit}
          onClick={() => void form.submitClaim()}
        >
          {isPending ? 'Claiming...' : 'Claim'}
        </Button>
      </Dialog.Actions>
    </Styled.Dialog>
  );
};
