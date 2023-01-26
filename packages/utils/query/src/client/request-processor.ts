import { filter, fromEvent, Observable, Subscriber, TeardownLogic } from 'rxjs';
import { Actions, actions } from './actions';

/**
 * General function for handling an abortable action
 */
export const requestProcessor =
    (action$: Observable<Actions>) =>
    (
        request: ReturnType<typeof actions.request>,
        cb?: (subscriber: Subscriber<Actions>) => TeardownLogic
    ): Observable<Actions> => {
        return new Observable((subscriber) => {
            const {
                meta: { controller, transaction },
            } = request;
            /**
          * if the abort signal has been triggered,
          * create a cancel action and complete the observable
         //  */
            if (controller.signal.aborted) {
                subscriber.next(
                    actions.cancel({
                        transaction,
                        reason: `request [${transaction}] was aborted!`,
                    })
                );
                return subscriber.complete();
            }

            /** subscribe to cancel request on the action stream */
            subscriber.add(
                action$.pipe(filter(actions.cancel.match)).subscribe((action) => {
                    /** if no transaction specified or transaction match current */
                    if (action.payload.transaction === transaction) {
                        if (!controller.signal.aborted) {
                            controller.abort();
                        }
                        subscriber.complete();
                    }
                })
            );

            /** subscribe to abort from the controller */
            subscriber.add(
                fromEvent(controller.signal, 'abort').subscribe(() => {
                    subscriber.next(
                        actions.cancel({
                            transaction,
                            reason: `request [${transaction}] was aborted!`,
                        })
                    );
                    subscriber.complete();
                })
            );

            /** call callback and add to teardown */
            if (cb) {
                return cb(subscriber);
            }
        });
    };

export default requestProcessor;
