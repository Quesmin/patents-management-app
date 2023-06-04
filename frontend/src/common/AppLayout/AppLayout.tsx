import React from "react";
import Header from "../Header/Header";
import { AccountState, CurrentAccount } from "../../types/Account";

type AppLayoutProps = React.PropsWithChildren<{
    currentAccount?: CurrentAccount;
}>;

const AppLayout: React.FC<AppLayoutProps> = ({ currentAccount, children }) => {
    return (
        <div className="h-full w-full">
            <Header currentAccount={currentAccount} />
            {children}
        </div>
    );
};

export default AppLayout;
