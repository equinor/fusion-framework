export const ErrorViewer = ({ error }: { readonly error: Error }) => {
    return (
        <>
            <div style={{ marginTop: 20, border: '1px solid' }}>
                <h4
                    style={{
                        backgroundColor: 'rgb(153, 0, 37)',
                        color: 'white',
                        padding: 10,
                        margin: 0,
                    }}
                >
                    {error.message}
                </h4>
                <section style={{ padding: 10 }}>{error.stack && <pre>{error.stack}</pre>}</section>
            </div>
            {error.cause && <ErrorViewer error={error.cause as Error} />}
        </>
    );
};

export default ErrorViewer;
