import { PersonCard, PersonAvatar, AvatarSize } from '@equinor/fusion-react-person';
import { tokens } from '@equinor/eds-tokens';
import styled from 'styled-components';

const Heading = styled.h1`
    text-align: center;
    margin-top: ${tokens.spacings.comfortable.x_large};
    margin-bottom: ${tokens.spacings.comfortable.x_small};
`;

const Subheading = styled.p`
    text-align: center;
`;

const CardList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${tokens.spacings.comfortable.medium};
    justify-content: center;
    padding-bottom: ${tokens.spacings.comfortable.medium};
`;

const CardItem = styled.div`
    width: '100%',
    maxWidth: '400px',
`;

export const App = () => {
    const azureIds = [
        'b40a0024-5dfd-4a6b-bb33-8d80bd3a4dde',
        '49132c24-6ea4-41fe-8221-112f314573f0',
        'cbc6480d-12c1-467e-b0b8-cfbb22612daa',
        'c81d9c4f-c882-4631-b0da-45e9ab9039c7',
        '3268952b-f566-49ed-a2b4-6feda8c0d5ef',
        '9716b649-5a4b-4470-9e0c-622742dc2935',
        '1ea5f203-c1ad-4893-bdea-4fadd95455e4',
    ];

    return (
        <>
            <div>
                <Heading>Person Cards</Heading>
                <Subheading>
                    This is a working example of {'<PersonCard>'} component, for more information
                    visit{' '}
                    <a
                        target="_blank"
                        href="https://equinor.github.io/fusion-react-components/?path=/docs/data-person-card--page"
                    >
                        PersonCard - Storybook
                    </a>
                </Subheading>
                <CardList>
                    {azureIds.map((azureId) => {
                        return (
                            <CardItem key={azureId}>
                                <PersonCard
                                    size={AvatarSize.Medium}
                                    contentHeight={250}
                                    maxWidth={300}
                                    azureId={azureId}
                                />
                            </CardItem>
                        );
                    })}
                </CardList>
            </div>
            <div>
                <Heading>Person Avatars</Heading>
                <Subheading>
                    This is a working example of {'<PersonAvatar>'} component, for more information
                    visit{' '}
                    <a
                        target="_blank"
                        href="https://equinor.github.io/fusion-react-components/?path=/docs/data-person-avatar--page"
                    >
                        PersonAvatar - Storybook
                    </a>
                </Subheading>
                <CardList>
                    {azureIds.map((azureId) => {
                        return (
                            <PersonAvatar
                                key={azureId}
                                size={AvatarSize.Medium}
                                azureId={azureId}
                            />
                        );
                    })}
                </CardList>
            </div>
        </>
    );
};

export default App;
