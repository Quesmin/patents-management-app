import { createSlice } from "@reduxjs/toolkit";
import { setCurrentAccountCaseReducer } from "./reducers";
import { accountInitialState } from "./state";

export const accountReducerSlice = createSlice({
    name: "account",
    initialState: accountInitialState,
    reducers: {
        setCurrentAccount: setCurrentAccountCaseReducer,
    },
});

export const { setCurrentAccount } = accountReducerSlice.actions;
