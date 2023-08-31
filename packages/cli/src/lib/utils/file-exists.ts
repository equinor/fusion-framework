import { accessSync, constants } from 'node:fs';
import { access } from 'node:fs/promises';

type Options = { assert?: boolean };

export const fileExistsSync = (file: string, options?: Options) => {
    try {
        accessSync(file, constants.F_OK);
        return true;
    } catch (err) {
        if (options?.assert) {
            throw err;
        }
        return false;
    }
};

export const fileExists = (file: string, options?: Options) => {
    try {
        access(file, constants.F_OK);
        return true;
    } catch (err) {
        if (options?.assert) {
            throw err;
        }
        return false;
    }
};
