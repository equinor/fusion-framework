import type { BookmarkState } from './types';

export const init: BookmarkState = {
  name: '',
  description: '',
  isShared: false,
  payload: {
    page: ' ',
    title: '',
    data: '',
  },
};