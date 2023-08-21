import { Typography } from '@equinor/eds-core-react';

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
