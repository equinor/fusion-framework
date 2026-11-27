import { Icon, Typography } from '@equinor/eds-core-react';
import type { PropsWithChildren } from 'react';
import { styled } from 'styled-components';

import { error_outlined, file_description } from '@equinor/eds-icons';

export type PortalMessageType = 'Error' | 'Info' | 'Warning' | 'NoContent';

const getMessageType = (type?: PortalMessageType) => {
  // Map each message type to its icon and color; unknown types render nothing
  switch (type) {
    case 'Error':
      return { color: 'var(--eds-color-text-danger-subtle)', icon: error_outlined };
    case 'Info':
      return { color: 'var(--eds-color-text-accent-subtle)', icon: error_outlined };
    case 'Warning':
      return { color: 'var(--eds-color-text-warning-subtle)', icon: error_outlined };
    case 'NoContent':
      return {
        color: 'var(--eds-color-text-accent-subtle)',
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

type MessageProps = {
  readonly title: string;
  readonly body?: React.FC | string;
  readonly type?: PortalMessageType;
  readonly color?: string;
};

/**
 * Displays a titled message with an icon matching its type.
 *
 * @param props - The component's props
 * @returns The message
 */
export const Message = ({
  title,
  type = 'Info',
  color,
  children,
}: PropsWithChildren<MessageProps>) => {
  const currentType = getMessageType(type);
  return (
    <Styles.Wrapper>
      <Icon
        data-testid="icon"
        size={40}
        // Applied as CSS so `var()` colours resolve; the SVG `fill` attribute can't use them
        style={{ color: currentType?.color || color || 'var(--eds-color-text-neutral-subtle)' }}
        data={currentType?.icon || error_outlined}
      />
      <Styles.Content>
        <Typography
          color="var(--eds-color-text-neutral-strong)"
          variant={'h3'}
          aria-label={`Title for ${type} message`}
        >
          {title}
        </Typography>

        <Typography>{children && children}</Typography>
      </Styles.Content>
    </Styles.Wrapper>
  );
};
