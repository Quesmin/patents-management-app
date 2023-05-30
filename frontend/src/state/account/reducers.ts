import { PayloadAction } from "@reduxjs/toolkit";
import { AccountState, CurrentAccount } from "../../types/Account";

export const setCurrentAccountCaseReducer = (
    state: AccountState,
    action: PayloadAction<CurrentAccount | undefined>
) => {
    state.currentAccount = action.payload;
};

export const loginCaseReducer = (
    state: AccountState,
    action: PayloadAction<CurrentAccount | undefined>
) => {
    state.currentAccount = action.payload;
    state.isMetamaskConnected = true;
};

export const logoutCaseReducer = (state: AccountState) => {
    state.currentAccount = undefined;
    state.isMetamaskConnected = false;
};
