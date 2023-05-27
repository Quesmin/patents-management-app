import { AccountState, CurrentAccount } from "../../types/Account";

export const currentAccountInitialState: CurrentAccount = {
    address: "",
};

export const accountInitialState: AccountState = {
    currentAccount: currentAccountInitialState,
};
