import ora, { Options, type Ora } from 'ora';

const parseArgs = (args: string[]): string | undefined =>
    args.length ? args.join(' ') : undefined;

export class Spinner {
    #ora: Ora;

    get ora(): Ora {
        return this.#ora;
    }

    static Global(options?: Options) {
        _spinner = new Spinner(options);
        return _spinner;
    }

    static Clone(spinner?: Spinner) {
        const { prefixText } = spinner || _spinner;
        return new Spinner({ prefixText });
    }

    static get Current(): Spinner {
        return _spinner;
    }

    static set Current(spinner: Spinner) {
        _spinner = spinner;
    }

    constructor(options?: Options) {
        this.#ora = ora(options);
    }

    get prefixText() {
        return this.#ora.prefixText;
    }
    info(...args: string[]) {
        this.#ora.info(parseArgs(args));
    }
    succeed(...args: string[]) {
        this.#ora.succeed(parseArgs(args));
    }
    start(...args: string[]) {
        this.#ora.start(parseArgs(args));
    }
    fail(...args: string[]) {
        this.#ora.fail(parseArgs(args));
    }
    warn(...args: string[]) {
        this.#ora.warn(parseArgs(args));
    }
    clear() {
        this.#ora.clear();
    }
    stop() {
        this.#ora.stop();
    }
    stopAndPersist(...args: Parameters<Ora['stopAndPersist']>) {
        this.#ora.stopAndPersist(...args);
    }
}

let _spinner = new Spinner();
