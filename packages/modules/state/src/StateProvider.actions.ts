import { type ActionTypes, createAction, createAsyncAction } from '@equinor/fusion-observable';
import type { IStateItem } from './StateItem';

export const actions = {
  storeItem: createAsyncAction(
    'store_item',
    (item: IStateItem) => {
      return { payload: { item } };
    },
    (item: IStateItem, errors?: Error[]) => {
      return { payload: { item, errors } };
    },
    (error) => {
      return { payload: { error } };
    }
  ),
  storeItems: createAsyncAction(
    'store_items',
    (items: Array<IStateItem>) => {
      return { payload: { items } };
    },
    (items: Array<IStateItem>, errors?: Error[]) => {
      return { payload: { items, errors } };
    },
    (error) => {
      return { payload: { error } };
    }
  ),
  setItems: createAction('set_items', (items: Array<IStateItem>) => {
    return { payload: { items } };
  }),
};

export type Actions = ActionTypes<typeof actions>;

export default actions;
