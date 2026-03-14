import { Typography } from '@equinor/eds-core-react';

/**
 * Recursively renders an error and its causal chain.
 *
 * Displays the error message and stack trace for each error in the `cause`
 * chain, providing full visibility into nested failures during app loading.
 *
 * @param props.error - The error to display, including any nested `cause` errors.
 * @returns A bordered section showing the error message, stack trace, and any nested causes.
 */
export const ErrorViewer = ({ error }: { readonly error: Error }) => {
  return (
    <>
      <div style={{ marginTop: 20, border: '1px solid' }}>
        <Typography variant="h4" color="warning">
          {error.message}
        </Typography>
        <section style={{ padding: 10 }}>{error.stack && <pre>{error.stack}</pre>}</section>
      </div>
      {error.cause && <ErrorViewer error={error.cause as Error} />}
    </>
  );
};

export default ErrorViewer;
