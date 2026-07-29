import { useApps } from '@equinor/fusion-framework-react/app';

/**
 * Renders the names of applications currently available to the portal.
 */
export const AppList = () => {
  const { apps } = useApps();
  return (
    <ul>
      {apps?.map((app) => (
        <li key={app.key}>{app.name}</li>
      ))}
    </ul>
  );
};

export default AppList;
