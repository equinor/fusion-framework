import { PersonCard } from '@equinor/fusion-react-person';
import { FlexGrid } from '../Styled';

/**
 * Renders a page with two `PersonCard` components, one with an `azureId` prop and one with a `upn` prop.
 *
 * The persons are fetched from the `PersonProvider` component, which are implemented in the host (application portal)
 *
 * In this example the `PersonCard` will request the profile photo from the `PersonProvider` by either the `azureId` or `upn`.
 */
export const CardPage = () => {
    return (
        <>
            <h2>Card</h2>
            <FlexGrid>
                <PersonCard azureId="cbc6480d-12c1-467e-b0b8-cfbb22612daa" />
                <PersonCard upn="handah@equinor.com" />
            </FlexGrid>
        </>
    );
};
