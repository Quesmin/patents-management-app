import { PayloadAction } from "@reduxjs/toolkit";
import { LicensedPatent, LicensedState } from "../../types/Patent";

export const setLicensedPatentsCaseReducer = (
    state: LicensedState,
    action: PayloadAction<LicensedPatent[]>
) => {
    state.licensedPatents = action.payload;
};
