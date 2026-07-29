export const toHumanReadable = (val: string) =>
  val
    .split('-')
    // Capitalize the first letter of each hyphen-separated segment
    .map((s) => `${s[0].toUpperCase()}${s.slice(1)}`)
    .join(' ');
