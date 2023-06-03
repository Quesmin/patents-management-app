import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../state/store";
import AppLayout from "../common/AppLayout/AppLayout";

type AuthRouteProps = React.PropsWithChildren;

const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
    const currentAccount = useAppSelector(
        (store) => store.account.currentAccount
    );

    if (currentAccount?.isAdmin) {
        return <Navigate to="/admin" />;
    }

    if (currentAccount) {
        return (
            <AppLayout currentAccount={currentAccount}>{children}</AppLayout>
        );
    }

    return <Navigate to="/" />;
};

export default AuthRoute;
