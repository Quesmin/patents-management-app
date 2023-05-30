import { useNavigate } from "react-router-dom";
import useBlockchainPatents from "../../hooks/useBlockchainPatents";
import { logout } from "../../state/account/slice";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { State } from "../../types/Common";
import { setPatents } from "../../state/patents/slice";

const Admin = () => {
    const currentAccount = useAppSelector(
        (state) => state.account.currentAccount
    );

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const blockchainPatents = useBlockchainPatents();

    const drafts = blockchainPatents.filter((p) => p.status === State.Pending);
    const granteds = blockchainPatents.filter(
        (p) => p.status === State.Granted
    );
    const revoked = blockchainPatents.filter(
        (p) => p.status === State.Rejected
    );

    return (
        <>
            <div>Admin</div>
            <div>Address: {currentAccount?.address}</div>
            <button
                onClick={async () => {
                    dispatch(setPatents([]));
                    dispatch(logout(undefined));
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
                            {d.expirationExtension === State.Pending && (
                                <div
                                    style={{
                                        backgroundColor: "red",
                                        height: 10,
                                        width: 10,
                                        display: "block",
                                    }}
                                ></div>
                            )}
                        </div>
                    ))}
                </>
            )}
            {granteds.length !== 0 && (
                <>
                    <h1 style={{ paddingBottom: 20 }}>Granted</h1>
                    {granteds.map((d) => (
                        <div
                            style={{ paddingBottom: 8 }}
                            key={d.id}
                            onClick={() => navigate("/admin/" + d.id)}
                        >
                            <div>{d.title}</div>
                            <div>{d.id}</div>
                            <div>{d.owner}</div>
                            <div>{d.expirationDate}</div>
                            {d.expirationExtension === State.Pending && (
                                <div
                                    style={{
                                        backgroundColor: "red",
                                        height: 10,
                                        width: 10,
                                    }}
                                ></div>
                            )}
                        </div>
                    ))}
                </>
            )}
            {revoked.length !== 0 && (
                <>
                    <h1 style={{ paddingBottom: 20 }}>Revoked</h1>
                    {revoked.map((d) => (
                        <div
                            style={{ paddingBottom: 8 }}
                            key={d.id}
                            onClick={() => navigate("/admin/" + d.id)}
                        >
                            <div>{d.title}</div>
                            <div>{d.id}</div>
                            <div>{d.owner}</div>
                            <div>{d.expirationDate}</div>
                        </div>
                    ))}
                </>
            )}
        </>
    );
};

export default Admin;
