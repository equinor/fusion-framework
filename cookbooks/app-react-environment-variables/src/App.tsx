import { useAppEnvironmentVariables } from '@equinor/fusion-framework-react-app';
export const App = () => {
    const { value, complete, error } = useAppEnvironmentVariables();
    if (!complete) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <pre>Error: {JSON.stringify(error, null, 2)}</pre>;
    }
    return <pre>{JSON.stringify(value, null, 2)}</pre>;
};

export default App;
