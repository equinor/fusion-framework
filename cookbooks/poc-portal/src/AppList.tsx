import { useApps } from '@equinor/fusion-framework-react/app';

export const AppList = () => {
    const { apps } = useApps();
    return <ul>{apps?.map((app) => <li key={app.key}>{app.name}</li>)}</ul>;
};

export default AppList;
