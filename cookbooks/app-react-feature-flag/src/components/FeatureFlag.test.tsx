import { expect, vi } from 'vitest';
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

import { FeatureFlag } from './FeatureFlag';

test('renders the flag title and description, and toggles it on click', async ({ render }) => {
  const onToggle = vi.fn();
  const { getByText, getByRole, unmount } = await render(
    <FeatureFlag
      flag={{ key: 'my-flag', title: 'My Flag', description: 'Does a thing', enabled: false }}
      onToggle={onToggle}
    />,
  );

  await expect.element(getByText('My Flag')).toBeInTheDocument();
  await expect.element(getByText('Does a thing')).toBeInTheDocument();

  const toggle = getByRole('checkbox');
  await expect.element(toggle).not.toBeChecked();

  await toggle.click();
  expect(onToggle).toHaveBeenCalledOnce();

  await unmount();
});
