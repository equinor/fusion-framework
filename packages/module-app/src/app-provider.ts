import { BehaviorSubject, Observable } from 'rxjs';
import { AppManifest } from './types';

export class AppProvider {
    protected _app$: BehaviorSubject<Record<string, AppManifest>>;
    protected _currentApp$: BehaviorSubject<AppManifest | null>;

    get app$(): Observable<Record<string, AppManifest>> {
        return this._app$.asObservable();
    }

    get currentApp(): AppManifest | null {
        return this._currentApp$.value;
    }

    constructor() {
        this._app$ = new BehaviorSubject({});
        this._currentApp$ = new BehaviorSubject<AppManifest | null>(null);
    }

    setCurrentApp(app: string | AppManifest): void {
        if (typeof app === 'string') {
            const next = this._app$.value[app];
            // TODO - better handling
            if (!next) {
                console.warn('could not find any app for key', app);
            }
            this._currentApp$.next(next);
        }
        this._currentApp$.next(app as AppManifest);
    }
}

export default AppProvider;
