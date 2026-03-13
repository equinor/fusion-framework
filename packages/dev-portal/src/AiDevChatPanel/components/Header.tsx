import { close, menu } from '@equinor/eds-icons';
import { Icon } from '@equinor/eds-core-react';
import { useEffect, useRef, useState } from 'react';
import { Styled } from '../styles.js';
import { getStatusText } from '../constants.js';
import type { ConnectionState } from '../types.js';

Icon.add({ close, menu });

interface HeaderProps {
  readonly connectionState: ConnectionState;
  readonly socketUrl: string;
  readonly showSystemMessages: boolean;
  readonly hiddenSystemMessageCount: number;
  readonly onToggleSystemMessages: () => void;
  readonly onClose: () => void;
}

/**
 * Chat panel header with status, agent/model selection, and filters.
 */
export function Header(props: HeaderProps): JSX.Element {
  const statusText = getStatusText(props.connectionState);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showFilterMenu) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!popoverRef.current?.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEscape);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [showFilterMenu]);

  return (
    <Styled.Header>
      <Styled.HeaderTop>
        <Styled.HeaderEyebrow>Fusion Live AI</Styled.HeaderEyebrow>
        <Styled.HeaderMeta>
          <Styled.ConnectionDot
            $state={props.connectionState}
            title={`${statusText} (${props.socketUrl})`}
            aria-label={statusText}
          />
          <Styled.TopIconButton
            type="button"
            title="Filter"
            aria-expanded={showFilterMenu}
            aria-haspopup="menu"
            onClick={() => setShowFilterMenu((x) => !x)}
          >
            <Icon data={menu} size={14} />
          </Styled.TopIconButton>
          <Styled.TopIconButton type="button" title="Close chat" onClick={props.onClose}>
            <Icon data={close} size={14} />
          </Styled.TopIconButton>
        </Styled.HeaderMeta>
      </Styled.HeaderTop>

      {showFilterMenu ? (
        <Styled.FilterPopover ref={popoverRef} role="menu" aria-label="Filter options">
          <Styled.FilterMenuItem
            type="button"
            role="menuitem"
            onClick={props.onToggleSystemMessages}
          >
            {props.showSystemMessages
              ? 'Hide system messages'
              : props.hiddenSystemMessageCount > 0
                ? `Show system messages (${props.hiddenSystemMessageCount})`
                : 'Show system messages'}
          </Styled.FilterMenuItem>
        </Styled.FilterPopover>
      ) : null}
    </Styled.Header>
  );
}
