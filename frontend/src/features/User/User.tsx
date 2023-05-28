import React from "react";
import { useAppDispatch } from "../../state/store";
import { disconnect } from "wagmi/actions";
import { setCurrentAccount } from "../../state/account/slice";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { MANAGEMENT_CONTRACT_ADDRESS } from "../../utils/constants";
import PatentManagement from "./../../abis/PatentManagement.json";
import { parseEther } from "viem";

const User = () => {
    const dispatch = useAppDispatch();
    const [patentTitle, setPatentTitle] = React.useState("");

    const { config } = usePrepareContractWrite({
        address: MANAGEMENT_CONTRACT_ADDRESS,
        abi: PatentManagement.abi,
        functionName: "submitDraftPatent",
        args: [patentTitle],
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        value: parseEther("3"),
    });

    const { write: submitDraft, isLoading } = useContractWrite(config);

    if (isLoading) {
        return <h1>Loading...</h1>;
    }

    return (
        <>
            <div>User</div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    submitDraft && submitDraft();
                    setPatentTitle("");
                }}
            >
                <input
                    type="text"
                    value={patentTitle}
                    onChange={(e) => setPatentTitle(e.target.value)}
                />
                <button type="submit">Submit upload</button>
            </form>
            <button
                onClick={async () => {
                    await disconnect();
                    dispatch(setCurrentAccount(undefined));
                }}
            >
                Disconnect
            </button>
        </>
    );
};

export default User;
