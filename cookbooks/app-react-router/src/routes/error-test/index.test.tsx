import { expect } from 'vitest';
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
import { testWithRouter } from '../../__tests__/test-with-router';
import type { ErrorElementProps } from '@equinor/fusion-framework-react-router';

import ErrorTestPage, { ErrorElement } from './index';

test('explains the error-boundary demonstration when rendered without an error', async ({ render }) => {
  const { getByText, unmount } = await render(<ErrorTestPage />);

  await expect.element(getByText('Error Test Page')).toBeInTheDocument();

  await unmount();
});

testWithRouter('renders the thrown error message and stack for the error boundary', async ({ render }) => {
  const error = new Error('This is a test error to demonstrate error boundaries in the router');
  // the boundary only reads `error`; `fusion` is required by ErrorElementProps but unused here
  const props = { error, fusion: {} } as unknown as ErrorElementProps<Error>;
  const { getByText, unmount } = await render(<ErrorElement {...props} />);

  // the message appears both in the summary div and inside the raw stack trace, so anchor to the summary's own prefix
  await expect.element(getByText(/^Error Message:/)).toBeInTheDocument();
  await expect.element(getByText('Retry')).toBeInTheDocument();
  await expect.element(getByText('Go Home')).toBeInTheDocument();

  await unmount();
});
