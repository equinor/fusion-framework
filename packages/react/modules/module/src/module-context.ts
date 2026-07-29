import { createContext } from 'react';

export const moduleContext = createContext<Record<string, unknown>>({});

export default moduleContext;
