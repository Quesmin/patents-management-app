import {
    BlockchainPatent,
    LicensedContractWithPatentData,
    PersonalPatentsWithRoyaltyContracts,
} from "../types/Patent";

const isBlockchainPatent = (patent: any): patent is BlockchainPatent => {
    return (
        "ipfsHash" in patent &&
        "owner" in patent &&
        "status" in patent &&
        "title" in patent &&
        "expirationDate" in patent &&
        "expirationExtension" in patent &&
        "id" in patent &&
        "licensees" in patent
    );
};

export const isBlockchainPatentArray = (
    patents: any
): patents is BlockchainPatent[] => {
    if (patents.length === 0) return true;
    return isBlockchainPatent(patents[0]);
};

export const isLicensedContractWithPatentDataArray = (
    contracts: any
): contracts is LicensedContractWithPatentData[] => {
    if (contracts.length === 0) return true;
    return (
        "patent" in contracts[0] &&
        "contractAddress" in contracts[0] &&
        "patentOwner" in contracts[0] &&
        "licensee" in contracts[0] &&
        "royaltyFee" in contracts[0] &&
        "paymentInterval" in contracts[0] &&
        "expirationDate" in contracts[0] &&
        "paidUntil" in contracts[0] &&
        "approvedForDestroy" in contracts[0] &&
        "paused" in contracts[0] &&
        "patent" in contracts[0] &&
        isBlockchainPatent(contracts[0].patent)
    );
};

export const isPersonalPatentsWithRoyaltyContractsArray = (
    patents: any
): patents is PersonalPatentsWithRoyaltyContracts[] => {
    console.log("🚀 ~ file: guardUtils.ts:51 ~ patents:", patents);
    if (patents.length === 0) return true;
    return (
        "patent" in patents[0] &&
        isBlockchainPatent(patents[0].patent) &&
        "royaltyContracts" in patents[0] &&
        (patents[0].royaltyContracts.length === 0 ||
            ("patentId" in patents[0].royaltyContracts[0] &&
                "contractAddress" in patents[0].royaltyContracts[0] &&
                "patentOwner" in patents[0].royaltyContracts[0] &&
                "licensee" in patents[0].royaltyContracts[0] &&
                "royaltyFee" in patents[0].royaltyContracts[0] &&
                "paymentInterval" in patents[0].royaltyContracts[0] &&
                "expirationDate" in patents[0].royaltyContracts[0] &&
                "paidUntil" in patents[0].royaltyContracts[0] &&
                "approvedForDestroy" in patents[0].royaltyContracts[0] &&
                "paused" in patents[0].royaltyContracts[0]))
    );
};
