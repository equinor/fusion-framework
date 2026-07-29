import { home } from '@equinor/eds-icons';
import type { RouteComponentProps, RouterHandle } from '@equinor/fusion-framework-react-router';
import '@equinor/fusion-wc-markdown/markdown-viewer';
import readmeAsset from '../../README.md?raw';

export const handle = {
  route: {
    description: 'Home page',
    title: 'Home',
    icon: home,
  },
} as const satisfies RouterHandle;

/**
 * Loads README markdown from the imported asset or its built URL.
 * @returns The README content for the markdown viewer.
 */
export async function clientLoader(): Promise<{ content: string }> {
  // During dev the import resolves to inline content (string),
  // during build it resolves to an asset URL that must be fetched.
  const isUrl = readmeAsset.startsWith('/') || readmeAsset.startsWith('http');
  const content = isUrl ? await fetch(readmeAsset).then((r) => r.text()) : readmeAsset;
  return { content };
}

/**
 * Renders the cookbook README as the router home page.
 * @param props - Route props containing the loader's markdown content.
 * @returns The markdown viewer for the README.
 */
export default function HomePage(props: RouteComponentProps<{ content: string }>) {
  const { content } = props.loaderData;
  return <fwc-markdown-viewer>{content}</fwc-markdown-viewer>;
}
