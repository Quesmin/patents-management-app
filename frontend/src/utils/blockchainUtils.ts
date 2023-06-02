import { parseEther } from "viem";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { AbiItem } from "web3-utils";
import PatentManagement from "../abis/PatentManagement.json";
import Royalty from "../abis/Royalty.json";
import {
    sendTransaction,
    waitForTransaction,
    writeContract,
} from "wagmi/actions";
import config from "../../config";
import axios from "axios";

const PatentManagementAbi = [...(PatentManagement.abi as AbiItem[])] as const;
const RoyaltyAbi = [...(Royalty.abi as AbiItem[])] as const;

export enum ContractAbi {
    PatentManagementAbi = "PatentManagementAbi",
    RoyaltyAbi = "RoyaltyAbi",
}

export const abiMap = {
    [ContractAbi.PatentManagementAbi]: PatentManagementAbi,
    [ContractAbi.RoyaltyAbi]: RoyaltyAbi,
};

export const areAddressesEqual = (
    address1: string | undefined,
    address2: string | undefined
) => {
    return address1?.toLowerCase() === address2?.toLowerCase();
};

export const writeAction = async (
    args: unknown[],
    functionName: string,
    valueToSend?: string,
    contractAbi = ContractAbi.PatentManagementAbi
) => {
    const currentAbi = abiMap[contractAbi];
    console.log(
        "🚀 ~ file: blockchainUtils.ts:47 ~ config.PATENT_MANAGEMENT_CONTRACT_ADDRESS:",
        config.PATENT_MANAGEMENT_CONTRACT_ADDRESS
    );

    try {
        const { hash } = await writeContract({
            address: config.PATENT_MANAGEMENT_CONTRACT_ADDRESS,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            abi: currentAbi,
            functionName: functionName,
            args: args,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            value: valueToSend
                ? parseEther(valueToSend as `${number}`)
                : undefined,
        });

        const receipt = await waitForTransaction({ hash });

        return receipt;
    } catch (error) {
        console.log("Error writing to contract: ");
        console.log(error);
        return null;
    }
};

export const transactionAction = async (to: string, value: string) => {
    try {
        const { hash } = await sendTransaction({
            // address: config.PATENT_MANAGEMENT_CONTRACT_ADDRESS,
            // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // //@ts-ignore
            // abi: currentAbi,
            // functionName: functionName,
            // args: args,
            // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // //@ts-ignore
            // value: valueToSend
            //     ? parseEther(valueToSend as `${number}`)
            //     : undefined,
            to: to,
            value: parseEther(value as `${number}`),
        });

        const receipt = await waitForTransaction({ hash });

        return receipt;
    } catch (error) {
        console.log("Error writing to contract: ");
        console.log(error);
        return null;
    }
};

export const submitToIpfsCall = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const result = await axios({
            method: "post",
            url: config.IPFS_SUBMIT_LINK,
            data: formData,
            headers: {
                pinata_api_key: config.PINATA_API_KEY,
                pinata_secret_api_key: config.PINATA_API_SECRET,
                "Content-Type": "multipart/form-data",
            },
        });

        const ipfsHash = result.data.IpfsHash as string;

        return ipfsHash;
    } catch (error) {
        console.log("Error sending File to IPFS: ");
        console.log(error);
        return null;
    }
};
export const removeFromIpfsCall = async (hash: string) => {
    try {
        await axios({
            method: "delete",
            url: `${config.IPFS_DELETE_LINK}/${hash}`,
            headers: {
                pinata_api_key: config.PINATA_API_KEY,
                pinata_secret_api_key: config.PINATA_API_SECRET,
            },
        });

        return true;
    } catch (error) {
        console.log("Error sending File to IPFS: ");
        console.log(error);
        return false;
    }
};
