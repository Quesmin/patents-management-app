import { State } from "./Common";

export interface BlockchainPatent {
    expirationDate: bigint;
    expirationExtension: State;
    id: string;
    licensees: string[];
    owner: string;
    status: State;
    title: string;
}

export interface PatentState {
    patents: BlockchainPatent[];
}
