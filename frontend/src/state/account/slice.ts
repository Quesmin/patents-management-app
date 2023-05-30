import { createSlice } from "@reduxjs/toolkit";
import {
    loginCaseReducer,
    logoutCaseReducer,
    setCurrentAccountCaseReducer,
} from "./reducers";
import { accountInitialState } from "./state";

export const accountReducerSlice = createSlice({
    name: "account",
    initialState: accountInitialState,
    reducers: {
        setCurrentAccount: setCurrentAccountCaseReducer,
        login: loginCaseReducer,
        logout: logoutCaseReducer,
    },
});

export const { setCurrentAccount, login, logout } = accountReducerSlice.actions;
