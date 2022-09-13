import { AnyModule } from './types';

export class ConsoleLogger {
    /** - 0-1-2-3 (error-warning-info-debug) if not provided only errors are logged */
    public level: 0 | 1 | 2 | 3 | 4 = 1;
    constructor(protected domain: string) {}

    /** @inheritdoc */
    protected _createMessage(msg: unknown[]): unknown[] {
        return [
            `%c FUSION FRAMEWORK %c ${this.domain} %c %s`,
            'background: rgb(179, 13, 47); color: white; padding: 1px;',
            'background: rgb(244, 244, 244); color: rgb(36, 55, 70); padding: 1px;',
            'background: none; color: inherit',
            ...msg.reduce((c: unknown[], n: unknown) => [...c, n, '\n'], []),
        ];
    }

    debug(...msg: unknown[]) {
        if (process.env.NODE_ENV === 'development') {
            this.level > 3 && console.debug(...this._createMessage(msg));
        }
    }
    info(...msg: unknown[]) {
        this.level > 2 && console.info(...this._createMessage(msg));
    }
    warn(...msg: unknown[]) {
        this.level > 1 && console.warn(...this._createMessage(msg));
    }
    error(...msg: unknown[]) {
        this.level > 0 && console.error(...this._createMessage(msg));
    }
}

export class ModuleConsoleLogger extends ConsoleLogger {
    public formatModuleName(moduleOrName: string | AnyModule): string {
        const name = typeof moduleOrName === 'string' ? moduleOrName : moduleOrName.name;
        return `📦\u001b[1;32m${name.replace(/([A-Z])/g, ' $1').toUpperCase()}\x1b[0m`;
    }
}
