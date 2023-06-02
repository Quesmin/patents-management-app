import React from "react";
import { useNavigate } from "react-router-dom";
import { disconnect, writeContract } from "wagmi/actions";
import useBlockchainPatents from "../../hooks/useBlockchainPatents";
import useWriteTransaction from "../../hooks/useWriteTransaction";
import { logout, setCurrentAccount } from "../../state/account/slice";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { State } from "../../types/Common";
import {
    areAddressesEqual,
    removeFromIpfsCall,
    submitToIpfsCall,
    writeAction,
} from "../../utils/blockchainUtils";
import { setPatents } from "../../state/patents/slice";
import { ethers } from "ethers";
import Web3 from "web3";
import config from "../../../config";
import { TransactionReceipt } from "viem";
import useLicensedPatents from "../../hooks/useLicensedPatents";
import {
    getLicensedPatentsAndContractsForCurrentUser,
    getPersonalGrantedPatentsWithRoyaltyContracts,
} from "../../utils/dataUtils";

export const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noreferrer");
};

const User = () => {
    const currentAccount = useAppSelector(
        (state) => state.account.currentAccount
    );
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [patentTitle, setPatentTitle] = React.useState("");
    const [patentFile, setPatentFile] = React.useState<File | null>(null);
    // const { transactionWrite: submitPatent } = useWriteTransaction(
    //     [patentTitle],
    //     "submitDraftPatent",
    //     "3"
    // );
    const blockchainPatents = useBlockchainPatents();
    const licensedPatents = useLicensedPatents();

    // const myGrantedPatent = blockchainPatents.filter(
    //     (p) =>
    //         areAddressesEqual(p.owner, currentAccount?.address) &&
    //         p.status === State.Granted
    // );

    const myGrantedPatentsWithContracts =
        getPersonalGrantedPatentsWithRoyaltyContracts(
            blockchainPatents,
            licensedPatents,
            currentAccount?.address
        );
    console.log(
        "🚀 ~ file: User.tsx:53 ~ User ~ myGrantedPatentsWithContracts:",
        myGrantedPatentsWithContracts
    );
    const myDraftPatents = blockchainPatents.filter(
        (p) =>
            areAddressesEqual(p.owner, currentAccount?.address) &&
            p.status === State.Pending
    );

    const myRevokedPatents = blockchainPatents.filter(
        (p) =>
            areAddressesEqual(p.owner, currentAccount?.address) &&
            p.status === State.Rejected
    );

    const licensedPatentsWithContracts =
        getLicensedPatentsAndContractsForCurrentUser(
            blockchainPatents,
            licensedPatents,
            currentAccount?.address
        );

    const handleSubmitPatent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!patentFile) return;

        const ipfsHash = await submitToIpfsCall(patentFile);

        if (!ipfsHash) return;

        const receipt = await writeAction(
            [patentTitle, ipfsHash],
            "submitDraftPatent",
            "3"
        );

        if (!receipt || !receipt.status) {
            await removeFromIpfsCall(ipfsHash);
        }

        setPatentTitle("");
        setPatentFile(null);
    };

    return (
        <>
            <div>User</div>
            <form
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: 20,
                }}
                onSubmit={handleSubmitPatent}
            >
                <input
                    placeholder="Patent title"
                    style={{ border: "1px solid black", width: "200px" }}
                    type="text"
                    value={patentTitle}
                    onChange={(e) => setPatentTitle(e.target.value)}
                />

                <input
                    placeholder="Patent PDF"
                    style={{ border: "1px solid black", width: "200px" }}
                    type="file"
                    accept="application/pdf"
                    required
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            setPatentFile(file);
                        }
                    }}
                />
                <button type="submit">Submit upload</button>
            </form>
            <button
                onClick={async () => {
                    dispatch(setPatents([]));
                    dispatch(logout(undefined));
                }}
            >
                Disconnect
            </button>

            <div>
                <h1 style={{ paddingBottom: 20 }}>Granted</h1>
                {myGrantedPatentsWithContracts.length !== 0 && (
                    <>
                        {myGrantedPatentsWithContracts.map((d) => (
                            <div
                                key={d.patent.id}
                                style={{
                                    paddingBottom: 8,
                                    border: "1px solid black",
                                }}
                                onClick={() =>
                                    navigate("/user/" + d.patent.id, {
                                        state: {
                                            royaltyContracts:
                                                d.royaltyContracts,
                                        },
                                    })
                                }
                            >
                                <div>{d.patent.title}</div>
                                <div>{d.patent.id}</div>
                                <div>{d.patent.owner}</div>
                                <div>{d.patent.expirationDate}</div>
                            </div>
                        ))}
                    </>
                )}
                <h1 style={{ paddingBottom: 20 }}>Draft</h1>
                {myDraftPatents.length !== 0 && (
                    <>
                        {myDraftPatents.map((d) => (
                            <div
                                key={d.id}
                                style={{
                                    paddingBottom: 8,
                                    border: "1px solid black",
                                }}
                                onClick={() => navigate("/user/" + d.id)}
                            >
                                <div>{d.title}</div>
                                <div>{d.id}</div>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openInNewTab(
                                            `${config.IPFS_GATEWAY}/${d.ipfsHash}`
                                        );
                                    }}
                                >
                                    {d.ipfsHash}
                                </div>
                                <div>{d.owner}</div>
                                <div>{d.expirationDate}</div>
                            </div>
                        ))}
                    </>
                )}
                <h1 style={{ paddingBottom: 20 }}>Revoked</h1>
                {myRevokedPatents.length !== 0 && (
                    <>
                        {myRevokedPatents.map((d) => (
                            <div
                                key={d.id}
                                style={{
                                    paddingBottom: 8,
                                    border: "1px solid black",
                                }}
                                onClick={() => navigate("/user/" + d.id)}
                            >
                                <div>{d.title}</div>
                                <div>{d.id}</div>
                                <div>{d.owner}</div>
                                <div>{d.expirationDate}</div>
                            </div>
                        ))}
                    </>
                )}

                <h1 style={{ paddingBottom: 20 }}>Licensed patents</h1>
                {licensedPatentsWithContracts.length !== 0 && (
                    <>
                        {licensedPatentsWithContracts.map((d) => (
                            <div
                                key={d.patent.id}
                                style={{
                                    paddingBottom: 8,
                                    border: "1px solid black",
                                }}
                                onClick={() =>
                                    navigate("/user/" + d.patent.id, {
                                        state: {
                                            royaltyContract: d,
                                        },
                                    })
                                }
                            >
                                <div>{d.patent.title}</div>
                                <div>{d.patent.id}</div>
                                <div>{d.patent.owner}</div>
                                <div>{d.patent.expirationDate}</div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </>
    );
};

export default User;
