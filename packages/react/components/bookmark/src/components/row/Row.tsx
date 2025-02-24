import { Icon, Typography } from '@equinor/eds-core-react';
import { tokens } from '@equinor/eds-tokens';
import { useOutsideClick } from '@equinor/eds-utils';
import { type MutableRefObject, type ReactNode, useCallback, useRef } from 'react';
import { MoreMenu } from './MoreMenu';

import styled from 'styled-components';
import { useBookmarkComponentContext } from '../BookmarkProvider';
import { from } from 'rxjs';

export type MenuOption = {
  name: string;
  disabled: boolean;
  onClick: VoidFunction;
  Icon?: ReactNode;
};

type RowProps = {
  readonly name: string;
  readonly id: string;
  readonly menuOpen: boolean;
  readonly onMenuOpen: (id: string) => void;
  readonly menuOptions: MenuOption[];
  readonly children?: ReactNode;
};

const Styled = {
  Icons: styled.div`
        display: flex;
        flex-direction: row;
        gap: 0.2em;
        align-items: center;
    `,
  ListItem: styled.div`
        cursor: pointer;
        &:hover {
            background-color: ${tokens.colors.ui.background__light.hex};
        }

        display: flex;
        align-items: center;
        height: 32px;
        min-height: 32px;
        max-height: 32px;
        justify-content: space-between;
        border-bottom: 1px solid ${tokens.colors.ui.background__medium.hex};
    `,
};

export const Row = ({ name, menuOptions, children, id, menuOpen, onMenuOpen }: RowProps) => {
  const pRef = useRef<HTMLElement | null>(null);
  const { provider } = useBookmarkComponentContext();

  const onListItemClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (provider) {
        from(provider.setCurrentBookmark(id)).subscribe();
      }
    },
    [provider, id],
  );

  useOutsideClick(pRef.current, () => onMenuOpen(''));

  // TODO: @noggling fix this
  return (
    /* eslint-disable-next-line styled-components-a11y/click-events-have-key-events, styled-components-a11y/no-static-element-interactions*/
    <Styled.ListItem onClick={onListItemClick}>
      <Typography>{name}</Typography>
      <Styled.Icons>
        {children}
        {!!menuOptions?.length && (
          <Icon
            name="more_vertical"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMenuOpen(id);
            }}
            color={tokens.colors.interactive.primary__resting.hex}
            ref={pRef as unknown as MutableRefObject<SVGSVGElement>}
          />
        )}

        <MoreMenu
          open={menuOpen}
          options={menuOptions}
          onClose={() => {
            onMenuOpen('');
          }}
          pRef={pRef}
        />
      </Styled.Icons>
    </Styled.ListItem>
  );
};
