import React from "react";
import { Navigate } from "react-router-dom";
import { useAccount, useContractRead } from "wagmi";
import { login, setCurrentAccount } from "../../state/account/slice";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { CurrentAccount } from "../../types/Account";
import { MANAGEMENT_CONTRACT_ADDRESS } from "../../utils/constants";
import PatentManagement from "./../../abis/PatentManagement.json";

const Landing = () => {
    const dispatch = useAppDispatch();
    const accountState = useAppSelector((store) => store.account);
    const { address, isConnected } = useAccount();
    const { data: adminAddress, isLoading: isLoadingAdminAddress } =
        useContractRead({
            address: MANAGEMENT_CONTRACT_ADDRESS,
            abi: PatentManagement.abi,
            functionName: "admin",
        });

    React.useEffect(() => {
        if (isConnected && address && accountState.isMetamaskConnected) {
            const newCurrentAccount: CurrentAccount = {
                address: address,
                isAdmin: adminAddress === address,
            };

            dispatch(setCurrentAccount(newCurrentAccount));
        }
    }, [
        accountState.isMetamaskConnected,
        address,
        adminAddress,
        dispatch,
        isConnected,
    ]);

    if (isLoadingAdminAddress) {
        return <h1>Loading...</h1>;
    }

    return (
        <>
            <div>Landing</div>
            {accountState.currentAccount ? (
                accountState.currentAccount.isAdmin ? (
                    <Navigate to="/admin" />
                ) : (
                    <Navigate to="/user" />
                )
            ) : (
                <button
                    onClick={() => {
                        dispatch(login(undefined));
                    }}
                >
                    Connect Wallet
                </button>
            )}
        </>
    );
};

export default Landing;
