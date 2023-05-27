import React, { ReactNode } from "react";

export const MetamaskContext = React.createContext(null);

type MetamaskProviderProps = {
    children?: React.ReactNode;
};

export const MetamaskProvider: React.FC<MetamaskProviderProps> = ({
    children,
}) => {
    return (
        <MetamaskContext.Provider value={values}>
            {children}
        </MetamaskContext.Provider>
    );
};
