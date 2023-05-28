import { PayloadAction } from "@reduxjs/toolkit";
import { BlockchainPatent, PatentState } from "../../types/Patent";

export const setPatentsCaseReducer = (
    state: PatentState,
    action: PayloadAction<BlockchainPatent[]>
) => {
    state.patents = action.payload;
};
