/** Vite `?inline` CSS imports resolve to the stylesheet text. */
declare module '*?inline' {
  const css: string;
  export default css;
}
