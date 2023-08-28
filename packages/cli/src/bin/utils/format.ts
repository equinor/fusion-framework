import { relative } from 'node:path';

import chalk from 'chalk';

export { chalk };

export const formatPath = (path: string, opt?: { relative?: boolean; cwd?: string }) => {
    return chalk.blueBright(opt?.relative ? relative(opt?.cwd ?? process.cwd(), path) : path);
};

export default chalk;