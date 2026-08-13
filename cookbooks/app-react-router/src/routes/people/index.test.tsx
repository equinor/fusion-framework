import { expect } from 'vitest';
import { testWithRouter } from '../../__tests__/test-with-router';

import { createRouteProps } from '../../__tests__/create-route-props';
import PeoplePage from './index';
import type { PersonSearchResult } from '../../api';

const persons: PersonSearchResult[] = [
  {
    azureUniqueId: 'abc-123',
    mail: 'ada.lovelace@example.com',
    name: 'Ada Lovelace',
    isResourceOwner: false,
  },
];

testWithRouter('shows the empty search prompt when no search has been made', async ({ render }) => {
  const props = createRouteProps({ persons: [], searchTerm: '' });
  const { getByText, unmount } = await render(<PeoplePage {...props} />);

  await expect.element(getByText('Search for People', { exact: true })).toBeInTheDocument();

  await unmount();
});

testWithRouter('renders matching people for a search term', async ({ render }) => {
  const props = createRouteProps({ persons, searchTerm: 'Ada' });
  const { getByText, unmount } = await render(<PeoplePage {...props} />);

  await expect.element(getByText(/found 1 result for "ada"/i)).toBeInTheDocument();
  await expect.element(getByText('Ada Lovelace')).toBeInTheDocument();

  await unmount();
});

testWithRouter('shows a no-results state when the search term matches nobody', async ({ render }) => {
  const props = createRouteProps({ persons: [], searchTerm: 'nobody' });
  const { getByText, unmount } = await render(<PeoplePage {...props} />);

  await expect.element(getByText(/no results found for "nobody"/i)).toBeInTheDocument();
  await expect.element(getByText('No Results', { exact: true })).toBeInTheDocument();

  await unmount();
});

testWithRouter('renders the action error message when the search submission failed validation', async ({ render }) => {
  const props = createRouteProps({ persons: [], searchTerm: '' }, { error: 'Search term is required' });
  const { getByText, unmount } = await render(<PeoplePage {...props} />);

  await expect.element(getByText('Search term is required')).toBeInTheDocument();

  await unmount();
});
