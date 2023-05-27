import React from "react";
import { useAccount, useContractRead } from "wagmi";
import PatentManagement from "../abis/PatentManagement.json";
import { Navigate } from "react-router-dom";
import { MANAGMENT_CONTRACT_ADDRESS } from "../utils/constants";

type AdminRouteProps = React.PropsWithChildren;

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const {
        isConnected,
        status,
        address: currentAccountAddress,
    } = useAccount();
    console.log("🚀 ~ file: AuthRoute.tsx:17 ~ status:", status);
    const { data: adminAddress, isLoading: isLoadingAdminAddress } =
        useContractRead({
            address: MANAGMENT_CONTRACT_ADDRESS,
            abi: PatentManagement.abi,
            functionName: "admin",
        });

    if (
        status === "connecting" ||
        status === "reconnecting" ||
        isLoadingAdminAddress
    ) {
        return <h1>Loading connecting...</h1>;
    }

    // if (isAdminRoute) {
    // if (isLoadingAdminAddress) {
    //     return <h1>Loading admin connecting...</h1>;
    // }

    if (currentAccountAddress === adminAddress) {
        return <>{children}</>;
    }
    // }

    if (!!currentAccountAddress && isConnected) {
        return <Navigate to="/user" />;
    }

    return <Navigate to="/" />;
};

export default AdminRoute;
