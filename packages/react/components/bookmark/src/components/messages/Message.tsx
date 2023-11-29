import { Icon, Typography } from '@equinor/eds-core-react';
import { tokens } from '@equinor/eds-tokens';
import { PropsWithChildren } from 'react';
import styled from 'styled-components';

import { error_outlined, file_description } from '@equinor/eds-icons';

export type PortalMessageType = 'Error' | 'Info' | 'Warning' | 'NoContent';

const getMessageType = (type?: PortalMessageType) => {
    switch (type) {
        case 'Error':
            return { color: tokens.colors.interactive.danger__resting.hex, icon: error_outlined };
        case 'Info':
            return { color: tokens.colors.interactive.primary__resting.hex, icon: error_outlined };
        case 'Warning':
            return { color: tokens.colors.interactive.warning__resting.hex, icon: error_outlined };
        case 'NoContent':
            return {
                color: tokens.colors.interactive.primary__resting.hex,
                icon: file_description,
            };
        default:
            return undefined;
    }
};

const Styles = {
    Wrapper: styled.div`
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        justify-content: center;
    `,
    Content: styled.div`
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        justify-content: center;
    `,
};

interface MessageProps {
    title: string;
    body?: React.FC | string;
    type?: PortalMessageType;
    color?: string;
}

export function Message({
    title,
    type = 'Info',
    color,
    children,
}: PropsWithChildren<MessageProps>) {
    const currentType = getMessageType(type);
    return (
        <Styles.Wrapper>
            <Icon
                data-testid="icon"
                size={40}
                color={currentType?.color || color || tokens.colors.text.static_icons__tertiary.hex}
                data={currentType?.icon || error_outlined}
            />
            <Styles.Content>
                <Typography
                    color={tokens.colors.text.static_icons__default.hex}
                    variant={'h3'}
                    aria-label={`Title for ${type} message`}
                >
                    {title}
                </Typography>

                <Typography>{children && children}</Typography>
            </Styles.Content>
        </Styles.Wrapper>
    );
}
