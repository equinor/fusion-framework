import { useCallback, useId, type ReactElement } from 'react';
import {
  ContextProvider,
  ContextSearch,
  type ContextSearchProps,
  type ContextSelectEvent,
  type ContextResultItem,
} from '@equinor/fusion-react-context-selector';
import { useContextResolver } from './useContextResolver';

// ContextSearch ignores an undefined preview; use an explicit empty item instead of a global clear event.
const emptyContextItem: ContextResultItem = {
  id: 'no-context',
  title: 'Select Context',
  subTitle: 'Context',
  graphic: 'list',
  isDisabled: true,
};

/**
 * Context selector component wired to the current application's context module.
 *
 * Renders a search input with dropdown results from the Fusion context service.
 * When the user selects a context item, it is set as the current context on the
 * application's context provider. Clearing the selector resets the current context.
 * Programmatic context changes, including `setCurrentContextByIdAsync` in route
 * loaders, update the preview through the same prop as the empty state, avoiding
 * document-wide clear events that can overwrite newer previews.
 *
 * @see {@link https://equinor.github.io/fusion-react-components/?path=/docs/data-contextselector--component | ContextSelector Storybook}
 * @param props - Passthrough props for the underlying `ContextSearch` component.
 * @returns The context selector element, or `null` if no context resolver is available.
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
      // Only react to selection/clear events when a provider is available to update
      if (provider) {
        // 'select' carries a chosen context item; anything else means the selector was cleared
        if (e.type === 'select') {
          // The 'select' event's `Event` type doesn't reflect the CustomEvent detail payload
          // dispatched by the underlying context-selector element, so a cast is required here.
          const ev = e as unknown as ContextSelectEvent;
          // Only set a new context when the user actually chose an item
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

  const previewItem = selectedContextItem ?? emptyContextItem;

  // Nothing to render until a context resolver has been resolved
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
          previewItem={previewItem}
          onClearContext={onContextSelect}
        />
      </ContextProvider>
    </div>
  );
};

export default ContextSelector;
