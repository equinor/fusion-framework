import { AnyModule } from './types';

export class ConsoleLogger {
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
        process.env.NODE_ENV === 'development' && console.debug(...this._createMessage(msg));
    }
    info(...msg: unknown[]) {
        console.info(...this._createMessage(msg));
    }
    warn(...msg: unknown[]) {
        console.warn(...this._createMessage(msg));
    }
    error(...msg: unknown[]) {
        console.error(...this._createMessage(msg));
    }
}

export class ModuleConsoleLogger extends ConsoleLogger {
    public formatModuleName(moduleOrName: string | AnyModule): string {
        const name = typeof moduleOrName === 'string' ? moduleOrName : moduleOrName.name;
        return `📦\u001b[1;32m${name.replace(/([A-Z])/g, ' $1').toUpperCase()}\x1b[0m`;
    }
}
