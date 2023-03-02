import { createContext, FC, PropsWithChildren } from 'react';

const Context = createContext({});

export const Provider: FC<PropsWithChildren<unknown>> = ({ children }) => {
    return <Context.Provider value={{}}>{children}</Context.Provider>;
};
