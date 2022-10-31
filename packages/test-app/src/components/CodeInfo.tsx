export const CodeInfo = (props: { data: unknown }) => (
    <pre>
        <code style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(props.data, undefined, 2)}</code>
    </pre>
);

export default CodeInfo;
