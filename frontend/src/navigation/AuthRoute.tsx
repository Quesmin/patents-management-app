import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../state/store";

type AuthRouteProps = React.PropsWithChildren;

const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
    const currentAccount = useAppSelector(
        (store) => store.account.currentAccount
    );

    if (currentAccount?.isAdmin) {
        return <Navigate to="/admin" />;
    }

    if (currentAccount) {
        return <>{children}</>;
    }

    return <Navigate to="/" />;
};

export default AuthRoute;
