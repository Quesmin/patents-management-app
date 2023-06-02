import { createSlice } from "@reduxjs/toolkit";
import { setLicensedPatentsCaseReducer } from "./reducers";
import { licensedInitialState } from "./state";

export const licensedReducerSlice = createSlice({
    name: "licensed",
    initialState: licensedInitialState,
    reducers: {
        setLicensedPatents: setLicensedPatentsCaseReducer,
    },
});

export const { setLicensedPatents } = licensedReducerSlice.actions;
