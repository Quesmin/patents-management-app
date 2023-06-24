import { PayloadAction } from "@reduxjs/toolkit";
import { NotificationState } from "../../types/Common";

export const setErrorAlertMessageCaseReducer = (
    state: NotificationState,
    action: PayloadAction<string>
) => {
    state.errorAlertMessage = action.payload;
};

export const setInfoModalMessageCaseReducer = (
    state: NotificationState,
    action: PayloadAction<string>
) => {
    state.infoModalMessage = action.payload;
};

export const setIsLoadingCaseReducer = (
    state: NotificationState,
    action: PayloadAction<boolean>
) => {
    state.isLoading = action.payload;
};
