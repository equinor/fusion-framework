import { cleanup, render } from 'vitest-browser-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import { RolesSheetContent } from './RolesSheetContent';

vi.mock('@equinor/fusion-framework-react-components-roles', () => ({
  RolesProvider: ({ children }: { children: ReactNode }) => children,
  RolesView: ({ compact }: { compact?: boolean }) => (
    <div>{compact ? 'Compact roles view' : 'Roles view'}</div>
  ),
}));

describe('RolesSheetContent', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the shared roles view and portal navigation', async () => {
    const navigate = vi.fn();
    const screen = await render(<RolesSheetContent navigate={navigate} />);

    await expect.element(screen.getByText('Compact roles view')).toBeVisible();
    await screen.getByRole('button', { name: 'My Roles' }).click();
    expect(navigate).toHaveBeenCalledOnce();
  });
});
