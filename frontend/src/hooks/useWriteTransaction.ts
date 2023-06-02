import { parseEther } from "viem";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { AbiItem } from "web3-utils";
import PatentManagement from "../abis/PatentManagement.json";
import config from "../../config";

const PatentManagementAbi = [...(PatentManagement.abi as AbiItem[])] as const;
// const RoyaltyAbi = [...Royalty.abi] as const;

export enum ContractAbi {
    PatentManagementAbi = "PatentManagementAbi",
    // RoyaltyAbi = "RoyaltyAbi",
}

export const abiMap = {
    [ContractAbi.PatentManagementAbi]: PatentManagementAbi,
    // [ContractAbi.RoyaltyAbi]: RoyaltyAbi,
};

const useWriteTransaction = (
    args: unknown[],
    functionName: string,
    valueToSend?: string,
    contractAbi = ContractAbi.PatentManagementAbi
) => {
    const currentAbi = abiMap[contractAbi];

    const { config: contractConfig } = usePrepareContractWrite({
        address: config.PATENT_MANAGEMENT_CONTRACT_ADDRESS,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        abi: currentAbi,
        functionName: functionName,
        args: args,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        value: valueToSend ? parseEther(valueToSend as `${number}`) : undefined,
    });

    const {
        data: transactionData,
        error: transactionError,
        isError: isTransactionError,
        isIdle: isTransactionIdle,
        isLoading: isTransactionLoading,
        isSuccess: isTransactionSuccess,
        write: transactionWrite,
        writeAsync: transactionWriteAsync,
        reset: transactionReset,
        status: transactionStatus,
    } = useContractWrite(contractConfig);

    return {
        transactionData,
        transactionError,
        isTransactionIdle,
        isTransactionLoading,
        isTransactionSuccess,
        transactionWrite,
        transactionWriteAsync,
        transactionReset,
        transactionStatus,
        isTransactionError,
    };
};

export default useWriteTransaction;
