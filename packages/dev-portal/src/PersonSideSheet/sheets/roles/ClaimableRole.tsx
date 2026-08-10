import {
  Banner,
  Button,
  CircularProgress,
  InputWrapper,
  Slider,
  Switch,
  Textarea,
  Typography,
} from '@equinor/eds-core-react';
import { useFramework } from '@equinor/fusion-framework-react';
import { useCurrentUser } from '@equinor/fusion-framework-react/hooks';
import type { ChangeEvent, ReactElement } from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import { RolesApi, type ClaimableRoleAssignment } from './RolesApi';

interface ClaimableRoleProps {
  readonly assignment: ClaimableRoleAssignment;
  onChange(assignment: ClaimableRoleAssignment): void;
}

const Styled = {
  Role: styled.div<{ $isClaiming: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    border: 1px solid ${({ $isClaiming }) => ($isClaiming ? '#6f6f6f' : 'transparent')};
    border-radius: 4px;
  `,
  Summary: styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;
  `,
  Name: styled.div`
    flex: 1;
  `,
  Indicator: styled.div<{ $active: boolean }>`
    width: 0.25rem;
    height: 2.5rem;
    background: ${({ $active }) => ($active ? '#007079' : '#dcdcdc')};
  `,
  Form: styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem;
  `,
  Actions: styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  `,
};

/**
 * Renders one claimable role with the production activation and deactivation workflow.
 *
 * @param props.assignment - Consolidated role assignment to display and mutate.
 * @param props.onChange - Reports successful activation state changes to the parent tab.
 * @returns A role row with activation controls.
 */
export const ClaimableRole = ({ assignment, onChange }: ClaimableRoleProps): ReactElement => {
  const framework = useFramework();
  const user = useCurrentUser();
  const [isClaiming, setIsClaiming] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [durationHours, setDurationHours] = useState(2);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string>();
  const now = Date.now();
  const isUpcoming = Boolean(
    assignment.validFrom && new Date(assignment.validFrom).getTime() > now,
  );
  const isExpired = Boolean(assignment.validTo && new Date(assignment.validTo).getTime() <= now);
  const isUnavailable = isUpcoming || isExpired;
  const availabilityLabel = isUpcoming ? 'Upcoming' : isExpired ? 'Expired' : undefined;

  /** Resets the activation form without changing the current assignment. */
  const resetForm = (): void => {
    setIsClaiming(false);
    setDurationHours(2);
    setReason('');
    setError(undefined);
  };

  /** Activates the role for the selected duration after validating the required reason. */
  const activateRole = async (): Promise<void> => {
    // The backend requires a meaningful reason for every temporary privilege elevation.
    if (!reason.trim()) {
      setError('Reason is required.');
      return;
    }

    // Role mutations require the Roles V2 account identifier from the authenticated session.
    if (!user?.localAccountId) {
      setError('Unable to resolve the signed-in Fusion account.');
      return;
    }

    setIsPending(true);
    setError(undefined);

    try {
      const client = await framework.modules.serviceDiscovery.createClient('rolesv2');
      const result = await new RolesApi(client, user.localAccountId).activateRole(
        assignment.id,
        reason.trim(),
        durationHours,
      );
      onChange({ ...assignment, isActive: true, activeTo: result.activeToDate });
      resetForm();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to activate role.');
    } finally {
      setIsPending(false);
    }
  };

  /** Deactivates an active claimable role and reports the updated assignment. */
  const deactivateRole = async (): Promise<void> => {
    // Role mutations require the Roles V2 account identifier from the authenticated session.
    if (!user?.localAccountId) {
      setError('Unable to resolve the signed-in Fusion account.');
      return;
    }

    setIsPending(true);
    setError(undefined);

    try {
      const client = await framework.modules.serviceDiscovery.createClient('rolesv2');
      await new RolesApi(client, user.localAccountId).deactivateRole(assignment.id);
      onChange({ ...assignment, isActive: false, activeTo: null });
      resetForm();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to deactivate role.');
    } finally {
      setIsPending(false);
    }
  };

  /**
   * Opens the activation form or deactivates the current assignment.
   * @param event - Switch state emitted by the role control.
   */
  const handleToggle = (event: ChangeEvent<HTMLInputElement>): void => {
    // Turning on an inactive role first opens the required activation form.
    if (event.target.checked && !assignment.isActive) {
      setIsClaiming(true);
      return;
    }

    // Turning off an active role immediately requests deactivation.
    if (!event.target.checked && assignment.isActive) {
      void deactivateRole();
    }
  };

  return (
    <Styled.Role $isClaiming={isClaiming}>
      <Styled.Summary>
        <Styled.Indicator $active={assignment.isActive} />
        <Styled.Name>
          <Typography>{assignment.claimableRole.displayName}</Typography>
          <Typography variant="overline">
            {assignment.claimableRole.name}
            {availabilityLabel ? ` (${availabilityLabel})` : ''}
          </Typography>
        </Styled.Name>
        <Switch
          aria-label={`Activate ${assignment.claimableRole.displayName}`}
          checked={assignment.isActive || isClaiming}
          disabled={isPending || isUnavailable}
          onChange={handleToggle}
        />
      </Styled.Summary>

      {isClaiming && !assignment.isActive && (
        <Styled.Form>
          <Typography variant="body_short">{assignment.claimableRole.description}</Typography>
          <InputWrapper
            labelProps={{ label: 'Duration (hours)' }}
            helperProps={{ text: 'Select how long this role should remain active' }}
          >
            <Slider
              value={durationHours}
              min={1}
              max={8}
              step={1}
              minMaxValues={false}
              onChangeCommitted={(_event, value) => setDurationHours(value[0])}
            />
          </InputWrapper>
          <Textarea
            label="Reason for activation"
            helperText="Enter a descriptive reason for activating this role"
            required
            rows={3}
            value={reason}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setReason(event.target.value)}
          />
          {error && (
            <Banner>
              <Banner.Message>{error}</Banner.Message>
            </Banner>
          )}
          <Styled.Actions>
            <Button variant="outlined" disabled={isPending} onClick={resetForm}>
              Cancel
            </Button>
            <Button variant="contained" disabled={isPending} onClick={() => void activateRole()}>
              {isPending ? <CircularProgress size={24} /> : 'Activate'}
            </Button>
          </Styled.Actions>
        </Styled.Form>
      )}

      {!isClaiming && error && (
        <Banner>
          <Banner.Message>{error}</Banner.Message>
        </Banner>
      )}
    </Styled.Role>
  );
};
