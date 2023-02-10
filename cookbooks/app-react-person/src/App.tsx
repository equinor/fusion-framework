import { PersonCard, PersonAvatar, AvatarSize } from '@equinor/fusion-react-person';
import { createStyles, makeStyles } from '@equinor/fusion-react-styles';
import { StrictMode } from 'react';

const useStyles = makeStyles(
    (theme) =>
        createStyles({
            section: {
                textAlign: 'center',
            },
            list: {
                display: 'flex',
                flexWrap: 'wrap',
                gap: theme.spacing.comfortable.medium.getVariable('padding'),
                justifyContent: 'center',
            },
            card: {
                border: '1px solid',
                padding: theme.spacing.comfortable.medium.getVariable('padding'),
                borderColor: theme.colors.interactive.primary__resting.getVariable('color'),
                borderRadius: theme.spacing.comfortable.medium.getVariable('padding'),
                width: '100%',
                maxWidth: '400px',
            },
        }),
    { name: 'person' }
);

export const App = () => {
    const styles = useStyles();

    return (
        <StrictMode>
            <div>
                <h1 style={{ textAlign: 'center' }}>Person Cards</h1>
                <p style={{ textAlign: 'center' }}>
                    This is a working example of {'<PersonCard>'} component, for more information
                    visit{' '}
                    <a
                        target="_blank"
                        href="https://equinor.github.io/fusion-react-components/?path=/docs/data-person-card--page"
                    >
                        PersonCard - Storybook
                    </a>
                </p>
                <div className={styles.list}>
                    <div className={styles.card}>
                        <PersonCard
                            size={AvatarSize.Medium}
                            azureId="b40a0024-5dfd-4a6b-bb33-8d80bd3a4dde"
                        />
                    </div>
                    <div className={styles.card}>
                        <PersonCard
                            size={AvatarSize.Medium}
                            azureId="49132c24-6ea4-41fe-8221-112f314573f0"
                        />
                    </div>
                    <div className={styles.card}>
                        <PersonCard
                            size={AvatarSize.Medium}
                            azureId="cbc6480d-12c1-467e-b0b8-cfbb22612daa"
                        />
                    </div>
                    <div className={styles.card}>
                        <PersonCard
                            size={AvatarSize.Medium}
                            azureId="c81d9c4f-c882-4631-b0da-45e9ab9039c7"
                        />
                    </div>
                    <div className={styles.card}>
                        <PersonCard
                            size={AvatarSize.Medium}
                            azureId="3268952b-f566-49ed-a2b4-6feda8c0d5ef"
                        />
                    </div>
                    <div className={styles.card}>
                        <PersonCard
                            size={AvatarSize.Medium}
                            azureId="9716b649-5a4b-4470-9e0c-622742dc2935"
                        />
                    </div>
                    <div className={styles.card}>
                        <PersonCard
                            size={AvatarSize.Medium}
                            azureId="1ea5f203-c1ad-4893-bdea-4fadd95455e4"
                        />
                    </div>
                </div>
            </div>
            <div className={styles.section}>
                <h1>Person Avatars</h1>
                <p>
                    This is a working example of {'<PersonAvatar>'} component, for more information
                    visit{' '}
                    <a
                        target="_blank"
                        href="https://equinor.github.io/fusion-react-components/?path=/docs/data-person-avatar--page"
                    >
                        PersonAvatar - Storybook
                    </a>
                </p>
                <div className={styles.list}>
                    <PersonAvatar
                        size={AvatarSize.Large}
                        azureId="b40a0024-5dfd-4a6b-bb33-8d80bd3a4dde"
                    />
                    <PersonAvatar
                        size={AvatarSize.Medium}
                        azureId="49132c24-6ea4-41fe-8221-112f314573f0"
                    />
                    <PersonAvatar
                        size={AvatarSize.Medium}
                        azureId="cbc6480d-12c1-467e-b0b8-cfbb22612daa"
                    />
                    <PersonAvatar
                        size={AvatarSize.Medium}
                        azureId="c81d9c4f-c882-4631-b0da-45e9ab9039c7"
                    />
                    <PersonAvatar
                        size={AvatarSize.Medium}
                        azureId="3268952b-f566-49ed-a2b4-6feda8c0d5ef"
                    />
                    <PersonAvatar
                        size={AvatarSize.Medium}
                        azureId="9716b649-5a4b-4470-9e0c-622742dc2935"
                    />
                    <PersonAvatar
                        size={AvatarSize.Medium}
                        azureId="1ea5f203-c1ad-4893-bdea-4fadd95455e4"
                    />
                </div>
            </div>
        </StrictMode>
    );
};

export default App;
