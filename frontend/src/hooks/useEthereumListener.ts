import { useEffect } from "react";
import { useContractRead } from "wagmi";
import PatentManagement from "../abis/PatentManagement.json";
import { setCurrentAccount } from "../state/account/slice";
import { useAppDispatch } from "../state/store";
import { CurrentAccount } from "../types/Account";
import { MANAGEMENT_CONTRACT_ADDRESS } from "../utils/constants";

// Custom hook to listen for Ethereum account, chain, or network changes
const useEthereumListener = () => {
    const dispatch = useAppDispatch();
    const { data: adminAddress } = useContractRead({
        address: MANAGEMENT_CONTRACT_ADDRESS,
        abi: PatentManagement.abi,
        functionName: "admin",
    });

    useEffect(() => {
        const handleAccountsChanged = (accounts: string[]) => {
            const updatedAccount = accounts[0] || undefined;

            if (!updatedAccount) {
                dispatch(setCurrentAccount(undefined));
            } else {
                const stateCurrentAccount: CurrentAccount = {
                    address: updatedAccount,
                    isAdmin:
                        (adminAddress as string).toLocaleLowerCase() ===
                        updatedAccount,
                };
                dispatch(setCurrentAccount(stateCurrentAccount));
            }
        };

        const handleChainChanged = (_chainId: string) => {
            dispatch(setCurrentAccount(undefined));
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
    }, [adminAddress, dispatch]);
};

export default useEthereumListener;
