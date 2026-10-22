import type { DetailedHTMLProps, PropsWithChildren } from 'react';
import type {
  MarkdownViewerElement,
  MarkdownViewerElementProps,
} from '@equinor/fusion-wc-markdown/markdown-viewer';

// `@equinor/fusion-wc-markdown` registers its tag on the global `JSX` namespace, but React 19's
// `react-jsx` transform only reads `React.JSX`, so the tag must be registered there as well.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'fwc-markdown-viewer': DetailedHTMLProps<
        PropsWithChildren<MarkdownViewerElementProps>,
        MarkdownViewerElement
      >;
    }
  }
}
