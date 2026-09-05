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
      <RoleClaimDialog defaultReason="" isClaiming={false} onClose={vi.fn()} onClaim={vi.fn()} />,
    );
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not submit whitespace-only reasons and allows cancellation before submitting', async () => {
    const onClaim = vi.fn();
    const onClose = vi.fn();
    const screen = await render(
      <RoleClaimDialog
        claim={claim}
        defaultReason=""
        isClaiming={false}
        onClose={onClose}
        onClaim={onClaim}
      />,
    );
    await screen.getByLabelText('Reason').fill('   ');
    await expect.element(screen.getByRole('button', { name: 'Claim', exact: true })).toBeDisabled();
    await screen.getByRole('button', { name: 'Cancel' }).click();
    expect(onClose).toHaveBeenCalledOnce();
    expect(onClaim).not.toHaveBeenCalled();
  });

  it('shows a rejected activation in the dialog and keeps the details for retry', async () => {
    const first = Promise.withResolvers<void>();
    const retry = Promise.withResolvers<void>();
    const onClaim = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(retry.promise);
    const onClose = vi.fn();
    const screen = await render(
      <RoleClaimDialog
        claim={claim}
        defaultReason=""
        isClaiming={false}
        onClose={onClose}
        onClaim={onClaim}
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
        'The role could not be activated. Try again or contact your administrator.',
      );
    expect(onClose).not.toHaveBeenCalled();
    await expect.element(screen.getByLabelText('Reason')).toHaveValue('  Continue reporting  ');
    await expect.element(screen.getByText('Duration: 4 hours')).toBeVisible();

    await screen.getByRole('button', { name: 'Claim', exact: true }).click();
    await expect.element(dialog.getByRole('alert')).not.toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Claiming...' })).toBeDisabled();
    expect(onClaim).toHaveBeenNthCalledWith(2, 'reports-exporter', 'Continue reporting', 4);
    retry.resolve();
    await expect.element(screen.getByRole('button', { name: 'Claim', exact: true })).toBeEnabled();
    expect(onClaim).toHaveBeenCalledTimes(2);
  });

  it('clears the previous failure and details when selecting a different assignment', async () => {
    const onClaim = vi.fn().mockRejectedValue(new Error('Activation failed'));
    const props = { defaultReason: 'Continue work', isClaiming: false, onClose: vi.fn(), onClaim };
    const screen = await render(<RoleClaimDialog {...props} claim={claim} />);
    await screen.getByRole('button', { name: 'Claim', exact: true }).click();
    await expect.element(screen.getByRole('alert')).toBeVisible();
    await screen.rerender(
      <RoleClaimDialog {...props} claim={{ ...claim, assignmentId: 'another-assignment' }} />,
    );
    await expect.element(screen.getByRole('alert')).not.toBeInTheDocument();
    await expect.element(screen.getByLabelText('Reason')).toHaveValue('Continue work');
  });
});
