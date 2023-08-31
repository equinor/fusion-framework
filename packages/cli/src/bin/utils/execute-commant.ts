import { fork } from 'node:child_process';
import { assert } from 'node:console';

// TODO move
type Commands = {
    app: {
        build: '';
        manifest: '';
    };
};

export const executeCommand = async <TProgram extends keyof Commands>(
    program: TProgram,
    command: keyof Commands[TProgram],
    // TODO map command args
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...options: any[]
) => {
    assert(process.env.CLI_BIN, 'expected bin path in env');
    return new Promise((resolve, reject) => {
        const job = fork(String(process.env.CLI_BIN), [program, command, ...(options ?? [])], {});
        job.addListener('close', resolve);
        job.addListener('error', reject);
    });
};
