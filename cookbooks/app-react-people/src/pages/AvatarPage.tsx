import { PersonAvatar } from '@equinor/fusion-react-person';
import { FlexGrid } from '../Styled';

/**
 * Renders a page with two `PersonAvatar` components, one using an Azure ID and one using an email address (UPN).
 *
 * The persons are fetched from the `PersonProvider` component, which are implemented in the host (application portal)
 *
 * In this example the `PersonAvatar` will request the profile photo from the `PersonProvider` by either the `azureId` or `upn`.
 *
 * @returns A React element representing the Avatar page.
 */
const AvatarPage = () => {
  return (
    <>
      <h2>Avatar</h2>
      <FlexGrid>
        <PersonAvatar azureId="cbc6480d-12c1-467e-b0b8-cfbb22612daa" />
        <PersonAvatar upn="handah@equinor.com" />
      </FlexGrid>
    </>
  );
};

export default AvatarPage;
