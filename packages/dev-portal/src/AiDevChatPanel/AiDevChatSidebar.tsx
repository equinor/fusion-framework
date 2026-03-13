import type { PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { styled } from 'styled-components';
import { AiDevChatPanel } from './AiDevChatPanel.js';

const DEFAULT_WIDTH = 352;
const MIN_WIDTH = 280;

const clampWidth = (value: number): number => {
  const maxWidth = Math.min(680, Math.floor(window.innerWidth * 0.65));
  return Math.max(MIN_WIDTH, Math.min(value, maxWidth));
};

const StyledSidebar = styled.section<{ $isOpen: boolean }>`
    grid-area: chat;
    overflow: hidden;
    position: relative;
  height: 100%;
  min-height: 0;
  align-self: stretch;
    visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};

    @media (max-width: 960px) {
      position: fixed;
      top: 48px;
      right: 0;
      bottom: 0;
      width: min(100vw, 420px) !important;
      max-width: 100vw;
      z-index: 20;
      background: #fff;
      border-left: 1px solid rgba(61, 61, 61, 0.18);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
      transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '100%')});
      transition: transform 160ms ease;
      visibility: visible;
    }
`;

const ResizeHandle = styled.button`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 10px;
    padding: 0;
    margin: 0;
    border: none;
    background: transparent;
    cursor: col-resize;
    z-index: 3;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 2px;
      background: rgba(61, 61, 61, 0.22);
    }

    &:hover::after,
    &:focus-visible::after {
      background: rgba(0, 112, 121, 0.72);
    }

    @media (max-width: 960px) {
      display: none;
    }
`;

interface AiDevChatSidebarProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const AiDevChatSidebar = ({ isOpen, onClose }: AiDevChatSidebarProps): JSX.Element => {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);

  useEffect(() => {
    if (!isOpen || !isResizing) return;

    const onPointerMove = (event: PointerEvent) => {
      const delta = event.clientX - startX.current;
      setWidth(clampWidth(startWidth.current + delta));
    };

    const onPointerUp = () => setIsResizing(false);

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isOpen, isResizing]);

  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => setWidth((current) => clampWidth(current));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isOpen]);

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    startX.current = event.clientX;
    startWidth.current = width;
    setIsResizing(true);
  };

  return (
    <StyledSidebar $isOpen={isOpen} style={{ width: `${width}px` }}>
      <AiDevChatPanel onClose={onClose} />
      {isOpen && (
        <ResizeHandle
          type="button"
          aria-label="Resize AI Dev panel"
          onPointerDown={onPointerDown}
        />
      )}
    </StyledSidebar>
  );
};
