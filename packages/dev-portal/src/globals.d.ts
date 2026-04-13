/**
 * Ambient JSX type declarations for Lit/WCEV web components used by dev-portal.
 *
 * `@types/react@19` removed the global `JSX` namespace — augmentations must
 * target the `react` module's `JSX` namespace instead.
 *
 * The `@equinor/fusion-wc-person` package still uses the old `global JSX` pattern
 * with computed-property keys so its declarations are not picked up by the compiler.
 * This file re-declares the elements with string-literal keys in the correct location.
 */
export {};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'fwc-person-avatar': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          azureId?: string;
          size?: string;
          clickable?: boolean;
        },
        HTMLElement
      >;
      'fwc-person-list-item': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          azureId?: string;
        },
        HTMLElement
      >;
    }
  }
}
