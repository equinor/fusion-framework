import React from 'react';
import { StarProgress } from '@equinor/fusion-react-progress-indicator';

export const EquinorLoader = ({
    children,
    text,
}: React.PropsWithChildren<{ text: string }>): JSX.Element => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
            }}
        >
            <StarProgress text={text}>{children}</StarProgress>
        </div>
    );
};

export default EquinorLoader;
