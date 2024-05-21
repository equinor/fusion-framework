import { Subject, type Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LogLevel, defaultLogLevel } from './static';
import { ILogger } from './Logger.interface';
import { version } from './version';

/**
 * Defines an abstract base class for a logger implementation that provides common logging functionality.
 *
 * The `Logger` class implements the `ILogger` interface and provides the following features:
 * - Configurable log level to control which messages are emitted
 * - Separate observables for raw and filtered log messages
 * - Convenience methods for logging at different levels (debug, info, warn, error)
 * - Ability to create sub-loggers with the same configuration
 *
 * Concrete implementations of the `Logger` class must implement the `_createMessage` and `createSubLogger` abstract methods.
 */
export abstract class Logger implements ILogger {
    public level: LogLevel = defaultLogLevel;
    public readonly version = version;

    // raw log, will emit all messages
    protected readonly _log$ = new Subject<{ lvl: LogLevel; msg: unknown[] }>();

    /**
     * The observable that emits log messages that are at a level greater than the logger's level.
     */
    public get log(): Observable<{ lvl: LogLevel; msg: unknown[] }> {
        return this._log$.pipe(filter((x) => this.level >= x.lvl));
    }

    public debug(...msg: unknown[]) {
        this._log$.next({ lvl: LogLevel.Debug, msg: this._createMessage(LogLevel.Debug, ...msg) });
    }
    public info(...msg: unknown[]) {
        this._log$.next({ lvl: LogLevel.Info, msg: this._createMessage(LogLevel.Info, ...msg) });
    }
    public warn(...msg: unknown[]) {
        this._log$.next({
            lvl: LogLevel.Warning,
            msg: this._createMessage(LogLevel.Warning, ...msg),
        });
    }
    public error(...msg: unknown[]) {
        this._log$.next({ lvl: LogLevel.Error, msg: this._createMessage(LogLevel.Error, ...msg) });
    }
    public abstract createSubLogger(...args: unknown[]): ILogger;
    protected abstract _createMessage(lvl: LogLevel, ...msg: unknown[]): unknown[];
}

export default Logger;
