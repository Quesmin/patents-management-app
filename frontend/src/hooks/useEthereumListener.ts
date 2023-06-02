import { useEffect } from "react";
import { useContractRead } from "wagmi";
import PatentManagement from "../abis/PatentManagement.json";
import { login, logout } from "../state/account/slice";
import { useAppDispatch, useAppSelector } from "../state/store";
import { CurrentAccount } from "../types/Account";
import { setPatents } from "../state/patents/slice";
import config from "../../config";

const useEthereumListener = () => {
    const dispatch = useAppDispatch();
    const accountState = useAppSelector((state) => state.account);
    const { data: adminAddress } = useContractRead({
        address: config.PATENT_MANAGEMENT_CONTRACT_ADDRESS,
        abi: PatentManagement.abi,
        functionName: "admin",
    });

    useEffect(() => {
        const handleAccountsChanged = (accounts: string[]) => {
            const updatedAccount = accounts[0] || undefined;

            if (!updatedAccount || !accountState.isMetamaskConnected) {
                dispatch(setPatents([]));
                dispatch(logout());
            } else {
                const stateCurrentAccount: CurrentAccount = {
                    address: updatedAccount,
                    isAdmin:
                        (adminAddress as string).toLocaleLowerCase() ===
                        updatedAccount,
                };
                dispatch(login(stateCurrentAccount));
            }
        };

        const handleChainChanged = (_chainId: string) => {
            dispatch(setPatents([]));
            dispatch(logout(undefined));
            window.location.reload();
        };

        if (window.ethereum) {
            window.ethereum.on("accountsChanged", handleAccountsChanged);
            window.ethereum.on("chainChanged", handleChainChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener(
                    "accountsChanged",
                    handleAccountsChanged
                );
                window.ethereum.removeListener(
                    "chainChanged",
                    handleChainChanged
                );
            }
        };
    }, [accountState.isMetamaskConnected, adminAddress, dispatch]);
};

export default useEthereumListener;
