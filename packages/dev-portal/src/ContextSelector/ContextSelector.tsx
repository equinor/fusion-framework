import { useCallback, useEffect, useId, useMemo, type ReactElement } from 'react';
import {
  ContextProvider,
  ContextSearch,
  type ContextSearchProps,
  type ContextSelectEvent,
  ContextClearEvent,
} from '@equinor/fusion-react-context-selector';
import { useContextResolver } from './useContextResolver';

/**
 * See fusion-react-component storybook for available attributes
 * @link https://equinor.github.io/fusion-react-components/?path=/docs/data-contextselector--component
 * @returns React element
 */
export const ContextSelector = (props: ContextSearchProps): ReactElement | null => {
  const contextSelectorId = useId();
  const {
    resolver,
    provider,
    currentContext: [selectedContextItem],
  } = useContextResolver();

  /** callback handler for context selector, when context is changed or cleared */
  const onContextSelect = useCallback(
    (e: Event | ContextSelectEvent) => {
      if (provider) {
        if (e.type === 'select') {
          const ev = e as unknown as ContextSelectEvent;
          if (ev.nativeEvent.detail.selected.length) {
            provider.contextClient.setCurrentContext(ev.nativeEvent.detail.selected[0].id);
          }
        } else {
          provider.clearCurrentContext();
        }
      }
    },
    [provider],
  );

  /**
   * Clears context when ctx has been cleared outside the selector.
   */
  const clearEvent = useMemo(() => new ContextClearEvent({ date: Date.now() }), []);
  useEffect(() => {
    if (!selectedContextItem) {
      document.dispatchEvent(clearEvent);
    }
  }, [clearEvent, selectedContextItem]);

  if (!resolver) return null;

  return (
    <div style={{ flex: 1, maxWidth: '480px' }}>
      <ContextProvider resolver={resolver}>
        <ContextSearch
          id={contextSelectorId}
          placeholder={props.placeholder ?? 'Search for context'}
          initialText={props.initialText ?? 'Start typing to search'}
          dropdownHeight={props.dropdownHeight ?? '300px'}
          variant={props.variant ?? 'header'}
          onSelect={(e: ContextSelectEvent) => onContextSelect(e)}
          selectTextOnFocus={true}
          previewItem={selectedContextItem}
          onClearContext={onContextSelect}
        />
      </ContextProvider>
    </div>
  );
};

export default ContextSelector;
