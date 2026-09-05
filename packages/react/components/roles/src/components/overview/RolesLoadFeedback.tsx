import type { ReactNode } from 'react';
import { Banner, Button } from '@equinor/eds-core-react';

/** Refresh state shared by both collection layouts. */
interface RolesLoadFeedbackProps {
  readonly isRefreshing: boolean;
  readonly error: unknown;
  readonly onRetry: () => Promise<void>;
}

/**
 * Keeps partial or stale collection data honest without unmounting open dialogs.
 * @param props - Background activity, collection failure, and local retry action.
 * @returns Non-blocking refresh status and actionable collection failure feedback.
 */
export const RolesLoadFeedback = ({
  isRefreshing,
  error,
  onRetry,
}: RolesLoadFeedbackProps): ReactNode => (
  <>
    {isRefreshing ? (
      <p role="status">Refreshing roles… Displayed roles may be out of date.</p>
    ) : null}
    {error ? (
      <>
        <Banner>
          <Banner.Message>
            Some roles could not be loaded. Displayed roles may be incomplete or out of date.{' '}
            {String(error)}
          </Banner.Message>
        </Banner>
        <Button
          variant="outlined"
          disabled={isRefreshing}
          onClick={() => {
            // Read failures are shown above; disposal only rejects an abandoned view's caller.
            void onRetry().catch(() => undefined);
          }}
        >
          Retry
        </Button>
      </>
    ) : null}
  </>
);
