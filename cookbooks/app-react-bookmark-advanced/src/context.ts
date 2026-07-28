import { createContext } from 'react';

import type { BookmarkState } from './types';

export interface BookmarkContext extends BookmarkState {
  updateState(cb: (state: BookmarkState) => Partial<BookmarkState>): void;
}

export const Context = createContext<BookmarkContext | null>(null);