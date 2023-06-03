import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../state/store";
import AppLayout from "../common/AppLayout/AppLayout";

type AdminRouteProps = React.PropsWithChildren;

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const currentAccount = useAppSelector(
        (store) => store.account.currentAccount
    );

    if (currentAccount?.isAdmin) {
        return (
            <AppLayout currentAccount={currentAccount}>{children}</AppLayout>
        );
    }

    if (currentAccount) {
        return <Navigate to="/user" />;
    }

    return <Navigate to="/" />;
};

export default AdminRoute;
