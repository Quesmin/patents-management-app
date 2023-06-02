import { State } from "./Common";

export interface BlockchainPatent {
    expirationDate: string;
    expirationExtension: State;
    id: string;
    ipfsHash: string;
    licensees: string[];
    owner: string;
    status: State;
    title: string;
}

export interface PatentState {
    patents: BlockchainPatent[];
}

export interface RoyaltyContractData {
    patentId: string;
    contractAddress: string;
    patentOwner: string;
    licensee: string;
    royaltyFee: string;
    paymentInterval: string;
    expirationDate: string;
    paidUntil: string;
    approvedForDestroy: boolean;
    paused: boolean;
}

export interface LicensedPatent {
    patentId: string;
    royaltyContractsData: RoyaltyContractData[];
}

export interface LicensedContractWithPatentData
    extends Omit<RoyaltyContractData, "patentId"> {
    patent: BlockchainPatent;
}

export interface PersonalPatentsWithRoyaltyContracts {
    patent: BlockchainPatent;
    royaltyContracts: RoyaltyContractData[];
}

export interface LicensedState {
    licensedPatents: LicensedPatent[];
}
