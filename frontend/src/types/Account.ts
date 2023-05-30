export interface CurrentAccount {
    address: string;
    isAdmin: boolean;
}

export interface AccountState {
    currentAccount?: CurrentAccount;
    isMetamaskConnected: boolean;
}
