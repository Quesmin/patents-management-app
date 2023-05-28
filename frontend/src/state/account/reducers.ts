import { PayloadAction } from "@reduxjs/toolkit";
import { AccountState, CurrentAccount } from "../../types/Account";

export const setCurrentAccountCaseReducer = (
    state: AccountState,
    action: PayloadAction<CurrentAccount | undefined>
) => {
    state.currentAccount = action.payload;
};
