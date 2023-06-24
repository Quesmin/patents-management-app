import { createSlice } from "@reduxjs/toolkit";
import {
    setErrorAlertMessageCaseReducer,
    setInfoModalMessageCaseReducer,
    setIsLoadingCaseReducer,
} from "./reducers";
import { notificationInitialState } from "./state";

export const notificationReducerSlice = createSlice({
    name: "notification",
    initialState: notificationInitialState,
    reducers: {
        setErrorAlertMessage: setErrorAlertMessageCaseReducer,
        setInfoModalMessage: setInfoModalMessageCaseReducer,
        setIsLoading: setIsLoadingCaseReducer,
    },
});

export const { setErrorAlertMessage, setInfoModalMessage, setIsLoading } =
    notificationReducerSlice.actions;
