import React from "react";
import { useNavigate } from "react-router-dom";
import { disconnect } from "wagmi/actions";
import useBlockchainPatents from "../../hooks/useBlockchainPatents";
import useWriteTransaction from "../../hooks/useWriteTransaction";
import { logout, setCurrentAccount } from "../../state/account/slice";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { State } from "../../types/Common";
import { areAddressesEqual } from "../../utils/blockchainUtils";
import { setPatents } from "../../state/patents/slice";

const User = () => {
    const currentAccount = useAppSelector(
        (state) => state.account.currentAccount
    );
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [patentTitle, setPatentTitle] = React.useState("");
    const { transactionWrite: submitPatent } = useWriteTransaction(
        [patentTitle],
        "submitDraftPatent",
        "3"
    );
    const blockchainPatents = useBlockchainPatents();

    const myGrantedPatent = blockchainPatents.filter(
        (p) =>
            areAddressesEqual(p.owner, currentAccount?.address) &&
            p.status === State.Granted
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

    return (
        <>
            <div>User</div>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();

                    submitPatent && submitPatent();

                    if (!submitPatent) {
                        console.log("submitPatent is undefined");
                        return;
                    }

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
                    dispatch(setPatents([]));
                    dispatch(logout(undefined));
                }}
            >
                Disconnect
            </button>

            <div>
                <h1 style={{ paddingBottom: 20 }}>Granted</h1>
                {myGrantedPatent.length !== 0 && (
                    <>
                        {myGrantedPatent.map((d) => (
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
            </div>
        </>
    );
};

export default User;
