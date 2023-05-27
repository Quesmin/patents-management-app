import { createSlice } from "@reduxjs/toolkit";
import { setCurrentAccountCaseReducer } from "./reducers";
import { accountInitialState } from "./state";

const AccountReducerSlice = createSlice({
    name: "account",
    initialState: accountInitialState,
    reducers: {
        setCurrentAccount: setCurrentAccountCaseReducer,
    },
});

export const { setCurrentAccount } = AccountReducerSlice.actions;

export const AccountReducer = AccountReducerSlice.reducer;
