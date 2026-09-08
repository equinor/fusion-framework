import { cleanup, render } from 'vitest-browser-react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RoleClaimDialog } from './RoleClaimDialog';

const claim = {
  assignmentId: 'reports-exporter',
  name: 'reports-exporter',
  displayName: 'Reports exporter',
};

describe('RoleClaimDialog', () => {
  afterEach(() => {
    cleanup();
  });

  it('stays hidden without a selected assignment', async () => {
    const screen = await render(
      <RoleClaimDialog
        defaultReason=""
        isActivating={false}
        onClose={vi.fn()}
        onActivate={vi.fn()}
      />,
    );
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('uses singular and plural duration labels as the slider changes', async () => {
    const screen = await render(
      <RoleClaimDialog
        claimableRoleAssignment={claim}
        defaultReason=""
        isActivating={false}
        onClose={vi.fn()}
        onActivate={vi.fn()}
      />,
    );
    await expect.element(screen.getByText('Duration: 2 hours', { exact: true })).toBeVisible();
    await screen.getByRole('slider').fill('1');
    await expect.element(screen.getByText('Duration: 1 hour', { exact: true })).toBeVisible();
    await screen.getByRole('slider').fill('8');
    await expect.element(screen.getByText('Duration: 8 hours', { exact: true })).toBeVisible();
  });

  it('does not submit whitespace-only reasons and allows cancellation before submitting', async () => {
    const onActivate = vi.fn();
    const onClose = vi.fn();
    const screen = await render(
      <RoleClaimDialog
        claimableRoleAssignment={claim}
        defaultReason=""
        isActivating={false}
        onClose={onClose}
        onActivate={onActivate}
      />,
    );
    await screen.getByLabelText('Reason').fill('   ');
    await expect.element(screen.getByRole('button', { name: 'Claim', exact: true })).toBeDisabled();
    await screen.getByRole('button', { name: 'Cancel' }).click();
    expect(onClose).toHaveBeenCalledOnce();
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('shows a rejected activation in the dialog and keeps the details for retry', async () => {
    const first = Promise.withResolvers<void>();
    const retry = Promise.withResolvers<void>();
    const onActivate = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(retry.promise);
    const onClose = vi.fn();
    const screen = await render(
      <RoleClaimDialog
        claimableRoleAssignment={claim}
        defaultReason=""
        isActivating={false}
        onClose={onClose}
        onActivate={onActivate}
      />,
    );
    await expect.element(screen.getByRole('button', { name: 'Claim', exact: true })).toBeDisabled();
    await screen.getByLabelText('Reason').fill('  Continue reporting  ');
    await screen.getByRole('slider').fill('4');
    await screen.getByRole('button', { name: 'Claim', exact: true }).click();
    await expect.element(screen.getByRole('button', { name: 'Claiming...' })).toBeDisabled();
    await expect.element(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await expect.element(screen.getByLabelText('Reason')).toBeDisabled();
    await expect.element(screen.getByRole('slider')).toBeDisabled();

    first.reject(new Error('Transport failure'));
    const dialog = screen.getByRole('dialog');
    await expect
      .element(dialog.getByRole('alert'))
      .toHaveTextContent(
        'The claimable role assignment could not be activated. Try again or contact your administrator.',
      );
    expect(onClose).not.toHaveBeenCalled();
    await expect.element(screen.getByLabelText('Reason')).toHaveValue('  Continue reporting  ');
    await expect.element(screen.getByText('Duration: 4 hours')).toBeVisible();

    await screen.getByRole('button', { name: 'Claim', exact: true }).click();
    await expect.element(dialog.getByRole('alert')).not.toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Claiming...' })).toBeDisabled();
    expect(onActivate).toHaveBeenNthCalledWith(2, 'reports-exporter', 'Continue reporting', 4);
    retry.resolve();
    await expect.element(screen.getByRole('button', { name: 'Claim', exact: true })).toBeEnabled();
    expect(onActivate).toHaveBeenCalledTimes(2);
  });

  it('clears the previous failure and details when selecting a different assignment', async () => {
    const onActivate = vi.fn().mockRejectedValue(new Error('Activation failed'));
    const props = {
      defaultReason: 'Continue work',
      isActivating: false,
      onClose: vi.fn(),
      onActivate,
    };
    const screen = await render(<RoleClaimDialog {...props} claimableRoleAssignment={claim} />);
    await screen.getByRole('button', { name: 'Claim', exact: true }).click();
    await expect.element(screen.getByRole('alert')).toBeVisible();
    await screen.rerender(
      <RoleClaimDialog
        {...props}
        claimableRoleAssignment={{ ...claim, assignmentId: 'another-assignment' }}
      />,
    );
    await expect.element(screen.getByRole('alert')).not.toBeInTheDocument();
    await expect.element(screen.getByLabelText('Reason')).toHaveValue('Continue work');
  });
});
