import { useCallback, useEffect, useId, useMemo } from 'react';
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
 * @returns JSX element
 */
export const ContextSelector = (props: ContextSearchProps): JSX.Element | null => {
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
        {/*
         * TODO(equinor/fusion-core-tasks#1428): `ContextSearch` will default to browser
         * top-layer rendering (`topLayer=true`) once `@equinor/fusion-react-context-selector`
         * ^2.1.0 is released (equinor/fusion-react-components#3314), built on
         * `@equinor/fusion-wc-searchable-dropdown` 4.2.0 (equinor/fusion-web-components#2368).
         * Neither is published yet, so no prop change is made here. This component already
         * passes through `ContextSearchProps` without setting `topLayer` explicitly, so it
         * will pick up the new default automatically. Once both packages are published:
         *   1. Bump `@equinor/fusion-react-context-selector` to `^2.1.0` here (and in
         *      `packages/dev-portal/package.json`).
         *   2. Run `pnpm install` to refresh `pnpm-lock.yaml`.
         *   3. Add a changeset for the `portal-analytics` cookbook (and
         *      `@equinor/fusion-framework-dev-portal`) describing the dependency bump.
         *   4. Run `pnpm test && pnpm build && pnpm -w check`.
         */}
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
