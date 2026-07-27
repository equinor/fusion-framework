import { Icon } from '@equinor/eds-core-react';
import { tokens } from '@equinor/eds-tokens';
import { useFramework } from '@equinor/fusion-framework-react';

import styled from 'styled-components';

const Styled = {
  Row: styled.div`
        display: flex;
        align-items: center;
        gap: 0.2em;
    `,
  CreatedBy: styled.p`
        font-size: 12px;
        font-weight: 500;
        line-height: 16px;
        letter-spacing: 0em;
        text-align: right;
    `,
};

type SharedIconProps = {
  readonly createdBy: string;
  readonly createdById: string;
};

/**
 * Displays a "shared by" indicator when a bookmark was created by another user.
 *
 * @param props - The component's props
 * @returns The shared icon, or nothing when the current user created the bookmark
 */
export const SharedIcon = ({ createdBy, createdById }: SharedIconProps) => {
  const myId = useFramework().modules.auth.account?.localAccountId;

  const isMe = createdById === myId;

  return (
    <Styled.Row>
      {!isMe && <Styled.CreatedBy>shared by {createdBy}</Styled.CreatedBy>}
      <Icon
        name="share"
        color={
          isMe
            ? tokens.colors.interactive.primary__resting.hex
            : tokens.colors.interactive.disabled__border.hex
        }
      />
    </Styled.Row>
  );
};
