import { prepareWriteContract, writeContract } from "@wagmi/core";
import { useContractRead } from "wagmi";
import { disconnect } from "wagmi/actions";
import { BlockchainPatent, State } from "../../types/Common";
import { setCurrentAccount } from "../../state/account/slice";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { MANAGEMENT_CONTRACT_ADDRESS } from "../../utils/constants";
import PatentManagement from "./../../abis/PatentManagement.json";
import { stat } from "fs";
import { useNavigate } from "react-router-dom";
import { setPatents } from "../../state/patents/slice";

const Admin = () => {
    const currentAccount = useAppSelector(
        (state) => state.account.currentAccount
    );
    // const patents = useAppSelector(
    //     (state) => state.
    // );

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { data, error, isError, isLoading } = useContractRead({
        address: MANAGEMENT_CONTRACT_ADDRESS,
        abi: PatentManagement.abi,
        functionName: "viewPatents",
    });

    if (data) {
        dispatch(setPatents(data as BlockchainPatent[]));
    } else {
        dispatch(setPatents([]));
    }

    // const { config } = usePrepareContractWrite({
    //     address: MANAGEMENT_CONTRACT_ADDRESS,
    //     abi: PatentManagement.abi,
    //     functionName: "submitDraftPatent",
    //     args: [patentTitle],
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     // @ts-ignore
    //     value: parseEther("3"),
    // });

    // const { write: setPatentState } = useContractWrite({
    //     address: MANAGEMENT_CONTRACT_ADDRESS,
    //     abi: PatentManagement.abi,
    //     functionName: "handlePatentState",
    //     args: [],
    // });

    // const handleSetPatentState = async (patentId: string, newState: State) => {
    //     const { hash } = await writeContract({
    //         address: MANAGEMENT_CONTRACT_ADDRESS,
    //         abi: PatentManagement.abi,
    //         functionName: "handlePatentState",
    //         args: [patentId, newState],
    //     });
    //     console.log(
    //         "🚀 ~ file: Admin.tsx:46 ~ handleSetPatentState ~ hash:",
    //         hash
    //     );
    // };

    const blockchainPatents = data as BlockchainPatent[];
    const drafts = blockchainPatents.filter((p) => p.status === State.Pending);
    const granteds = blockchainPatents.filter(
        (p) => p.status === State.Granted
    );
    const revoked = blockchainPatents.filter(
        (p) => p.status === State.Rejected
    );
    console.log("🚀 ~ file: Admin.tsx:16 ~ Admin ~ data:", data);

    return (
        <>
            <div>Admin</div>
            <div>Address: {currentAccount?.address}</div>
            <button
                onClick={async () => {
                    await disconnect();
                    dispatch(setCurrentAccount(undefined));
                }}
            >
                Disconnect
            </button>
            {drafts.length !== 0 && (
                <>
                    <h1 style={{ paddingBottom: 20 }}>Drafts</h1>
                    {drafts.map((d) => (
                        <div
                            key={d.id}
                            style={{
                                paddingBottom: 8,
                                border: "1px solid black",
                            }}
                            onClick={() => navigate("/admin/" + d.id)}
                        >
                            <div>{d.title}</div>
                            <div>{d.id}</div>
                            <div>{d.owner}</div>
                            <div>{d.expirationDate}</div>
                            {/* <button
                                onClick={async () => {
                                    await handleSetPatentState(
                                        d.id,
                                        State.Granted
                                    );
                                }}
                            >
                                Grant
                            </button> */}
                        </div>
                    ))}
                </>
            )}
            {granteds.length !== 0 && (
                <>
                    <h1 style={{ paddingBottom: 20 }}>Granted</h1>
                    {granteds.map((d) => (
                        <div style={{ paddingBottom: 8 }}>
                            <div>{d.title}</div>
                            <div>{d.id}</div>
                            <div>{d.owner}</div>
                            <div>{d.expirationDate}</div>
                            {/* <button
                                onClick={async () => {
                                    await handleSetPatentState(
                                        d.id,
                                        State.Pending
                                    );
                                }}
                            >
                                Move in Pending
                            </button> */}
                        </div>
                    ))}
                </>
            )}
            {revoked.length !== 0 && (
                <>
                    <h1 style={{ paddingBottom: 20 }}>Revoked</h1>
                    {revoked.map((d) => (
                        <div style={{ paddingBottom: 8 }}>
                            <div>{d.title}</div>
                            <div>{d.id}</div>
                            <div>{d.owner}</div>
                            <div>{d.expirationDate}</div>
                            {/* <button
                                onClick={async () => {
                                    await handleSetPatentState(
                                        d.id,
                                        State.Pending
                                    );
                                }}
                            >
                                Move in Pending
                            </button> */}
                        </div>
                    ))}
                </>
            )}
        </>
    );
};

export default Admin;
