import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../state/store";

type AdminRouteProps = React.PropsWithChildren;

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const currentAccount = useAppSelector(
        (store) => store.account.currentAccount
    );

    if (currentAccount?.isAdmin) {
        return <>{children}</>;
    }

    if (currentAccount) {
        return <Navigate to="/user" />;
    }

    return <Navigate to="/" />;
};

export default AdminRoute;
