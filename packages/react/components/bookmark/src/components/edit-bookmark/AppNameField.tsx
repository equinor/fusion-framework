import { Input, Progress } from '@equinor/eds-core-react';

/**
 * Renders the bookmark's app name while making manifest resolution visible.
 *
 * @param props - The resolved display name and whether the manifest request is pending.
 * @returns A read-only app name field with an accessible loading indicator when needed.
 */
export const AppNameField = ({
  id,
  displayName,
  isLoading,
}: {
  readonly id: string;
  readonly displayName?: string;
  readonly isLoading: boolean;
}) => (
  <Input
    id={id}
    readOnly={true}
    value={displayName ?? ''}
    aria-busy={isLoading}
    rightAdornments={
      isLoading ? <Progress.Circular aria-label="Loading app name" size={16} /> : undefined
    }
  />
);
