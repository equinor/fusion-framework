import { Typography } from '@equinor/eds-core-react';
/**
 * Renders the HomePage component, which provides an overview of working with the People.
 *
 * @returns A React element representing the HomePage component.
 */
export const HomePage = () => {
  return (
    <div>
      <Typography variant="body_short_bold" style={{ marginBottom: '1rem' }} as={'div'}>
        <p>
          The People API allows you to retrieve information about individuals within Fusion. It
          provides endpoints to fetch person details, search for people, retrieve profile photos and
          much more.
        </p>
        <a
          href="https://equinor.github.io/fusion-react-components/?path=/docs/person-docs--docs"
          target="_blank" rel="noreferrer"
        >
          📦 See our storybook documentation for more information about People React components.
        </a>
      </Typography>
      <Typography variant="h2">Usage</Typography>
      <Typography variant="body_long" as={'div'}>
        <p>
          To use the People API in your application, you need to make HTTP requests to the
          appropriate endpoints. The API supports different versions, so make sure to specify the
          desired version in your requests.
        </p>
        <a
          href="https://fusion-docs.equinor.com/fusion-platform/people/api/index.html"
          target="_blank" rel="noreferrer"
        >
          📚 Read the swagger documentation for people API
        </a>
        <p>
          You can explore the different components in the navigation above to see examples of how to
          use the People Components in your React application. These components demonstrate how to
          show person details, search for people, and display profile avatars.
        </p>
      </Typography>
    </div>
  );
};
