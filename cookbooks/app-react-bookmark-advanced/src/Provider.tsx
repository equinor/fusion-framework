import { useCurrentBookmark } from '@equinor/fusion-framework-react-module-bookmark';

import { useBookmark } from '@equinor/fusion-framework-react-app/bookmark';

import {
  type FC,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { Context } from './context';
import { init } from './init';
import type { BookmarkState } from './types';

/** Provides shared bookmark form state and synchronizes it with the selected bookmark. */
export const Provider: FC<PropsWithChildren<unknown>> = ({ children }) => {
  const [state, setState] = useState<BookmarkState>(init);

  const { getAllBookmarks } = useBookmark();

  const { currentBookmark } = useCurrentBookmark(useCallback(() => state.payload, [state.payload]));

  const updateState = useCallback((cb: (state: BookmarkState) => Partial<BookmarkState>) => {
    // Merge the partial update from the callback into the existing state.
    setState((s) => ({ ...s, ...cb(s) }));
  }, []);

  // Load the selected bookmark into the form whenever selection changes.
  useEffect(() => {
    currentBookmark?.payload &&
      setState({
        ...currentBookmark,
        payload: currentBookmark.payload,
      });
  }, [currentBookmark]);

  useEffect(() => {
    getAllBookmarks();
  }, [getAllBookmarks]);

  return (
    <Context.Provider
      value={
        // Expose the current form state and updater through the private context boundary.
        { ...state, updateState }
      }
    >
      {children}
    </Context.Provider>
  );
};
