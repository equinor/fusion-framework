import { relative } from 'node:path';
import { statSync } from 'node:fs';

import chalk from 'chalk';

import prettyBytes from 'pretty-bytes';

export { chalk };

export const formatPath = (path: string, opt?: { relative?: boolean; cwd?: string }) => {
    return chalk.blueBright(opt?.relative ? relative(opt?.cwd ?? process.cwd(), path) : path);
};

export const formatByteSize = (input: string | number): string => {
    if (typeof input === 'string') {
        return formatByteSize(statSync(input).size);
    }
    return chalk.yellowBright(prettyBytes(input));
};

export default chalk;
