import { createContext } from '@equinor/fusion-framework-react-router';

interface DemoExecution {
  events: string[];
  viewer: string;
}

/** Per-execution demo state; no default hides a missing parent middleware. */
export const demoContext = createContext<DemoExecution>();
