import { Flow } from '@equinor/fusion-observable';
import { filter, map } from 'rxjs';
import actions, { Actions } from '../actions';

export const handleRetry: Flow<Actions> = (action$) =>
    action$.pipe(
        filter(actions.retry.match),
        map((x) => x.payload)
    );
