import { home } from '@equinor/eds-icons';
import type { RouterHandle } from '@equinor/fusion-framework-react-router';
import '@equinor/fusion-wc-markdown/markdown-viewer';
import readmeContent from '../../README.md?raw';

export const handle = {
  route: {
    description: 'Home page',
    title: 'Home',
    icon: home,
  },
} as const satisfies RouterHandle;

export default function HomePage() {
  return <fwc-markdown-viewer>{readmeContent}</fwc-markdown-viewer>;
}
