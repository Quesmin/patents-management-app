import { State } from "./Common";

export interface BlockchainPatent {
    expirationDate: string;
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
