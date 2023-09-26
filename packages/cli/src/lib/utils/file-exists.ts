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

export const fileExists = async (file: string, options?: Options): Promise<boolean> => {
    try {
        await access(file, constants.F_OK);
        return true;
    } catch (err) {
        if (options?.assert) {
            throw err;
        }
        return false;
    }
};
