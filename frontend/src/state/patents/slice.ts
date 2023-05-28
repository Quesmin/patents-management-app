import { createSlice } from "@reduxjs/toolkit";
import { setPatentsCaseReducer } from "./reducers";
import { patentInitialState } from "./state";

export const patentReducerSlice = createSlice({
    name: "patent",
    initialState: patentInitialState,
    reducers: {
        setPatents: setPatentsCaseReducer,
    },
});

export const { setPatents } = patentReducerSlice.actions;
