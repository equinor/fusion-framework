export const toHumanReadable = (val: string) =>
  val
    .split('-')
    .map((s) => `${s[0].toUpperCase()}${s.slice(1)}`)
    .join(' ');
