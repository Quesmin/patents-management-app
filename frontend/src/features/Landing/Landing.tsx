import { Navigate } from "react-router-dom";
import { useAccount, useConnect, useContractRead } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MANAGEMENT_CONTRACT_ADDRESS } from "../../utils/constants";
import PatentManagement from "./../../abis/PatentManagement.json";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { CurrentAccount } from "../../types/Account";
import { setCurrentAccount } from "../../state/account/slice";

const Landing = () => {
    const dispatch = useAppDispatch();
    const currentAccount = useAppSelector(
        (store) => store.account.currentAccount
    );
    const { address, isConnected } = useAccount();
    const { data: adminAddress, isLoading: isLoadingAdminAddress } =
        useContractRead({
            address: MANAGEMENT_CONTRACT_ADDRESS,
            abi: PatentManagement.abi,
            functionName: "admin",
        });

    const { connect } = useConnect({
        connector: new InjectedConnector(),
    });

    React.useEffect(() => {
        if (isConnected && address) {
            const newCurrentAccount: CurrentAccount = {
                address: address,
                isAdmin: adminAddress === address,
            };

            dispatch(setCurrentAccount(newCurrentAccount));
        }
    }, [address, adminAddress, dispatch, isConnected]);

    if (isLoadingAdminAddress) {
        return <h1>Loading...</h1>;
    }

    return (
        <>
            <div>Landing</div>
            {currentAccount ? (
                currentAccount.isAdmin ? (
                    <Navigate to="/admin" />
                ) : (
                    <Navigate to="/user" />
                )
            ) : (
                <button onClick={() => connect()}>Connect Wallet</button>
            )}
        </>
    );
};

export default Landing;
