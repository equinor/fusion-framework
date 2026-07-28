import { useContext } from 'react';

import { Context } from './context';

/** Reads the bookmark form state managed by the nearest bookmark Provider. */
export const useBookmarkContext = () => {
  const context = useContext(Context);

  // Fail early so consumers do not operate on an unavailable bookmark context.
  if (!context) {
    throw new Error('BookmarkContext context used out of bounds');
  }
  return context;
};