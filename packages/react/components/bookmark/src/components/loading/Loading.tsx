import { CircularProgress } from '@equinor/eds-core-react';

/**
 * A centered loading spinner.
 *
 * @returns The loading indicator
 */
export const Loading = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
    }}
  >
    <CircularProgress />
  </div>
);
