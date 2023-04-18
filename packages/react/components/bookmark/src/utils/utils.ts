import { Bookmark } from '@equinor/fusion-framework-module-bookmark';

/** Helpers.. */
export const filterEmptyGroups = (i: { values: Bookmark[] }) => i.values.length;
export const sortByName = (a: Bookmark, b: Bookmark) => a.name.localeCompare(b.name);
// const extractNameFromMail = (mail: string) => mail.split('@')[0].toLowerCase();

export const toHumanReadable = (val: string) =>
    val
        .split('-')
        .map((s) => `${s[0].toUpperCase()}${s.slice(1)}`)
        .join(' ');
