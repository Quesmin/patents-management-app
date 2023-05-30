import moment from "moment";
import { Navigate, useParams } from "react-router-dom";
import { writeContract } from "wagmi/actions";
import { useAppSelector } from "../../state/store";
import { State } from "../../types/Common";
import { MANAGEMENT_CONTRACT_ADDRESS } from "../../utils/constants";
import PatentManagement from "./../../abis/PatentManagement.json";

const Patent = () => {
    const currentUser = useAppSelector((state) => state.account.currentAccount);
    const { id: currentPatentId } = useParams();
    const patents = useAppSelector((state) => state.patent.patents);
    const currentPatent = patents.find((p) => p.id === currentPatentId);
    const hasCurrentPatentExtensionRequest =
        currentPatent?.expirationExtension === State.Pending;
    const extensionRequestNotInitiated =
        currentPatent?.expirationExtension === State.NotStarted;

    if (!currentPatent) {
        return <Navigate to="/not-found" />;
    }

    const handleSetPatentState = async (patentId: string, newState: State) => {
        const { _hash } = await writeContract({
            address: MANAGEMENT_CONTRACT_ADDRESS,
            abi: PatentManagement.abi,
            functionName: "handlePatentState",
            args: [patentId, newState],
        });
    };

    const handleExtendExpirationState = async (
        patentId: string,
        newState: State
    ) => {
        const { _hash } = await writeContract({
            address: MANAGEMENT_CONTRACT_ADDRESS,
            abi: PatentManagement.abi,
            functionName: "handlePatentExtensionRequest",
            args: [patentId, newState],
        });
    };

    const handleRequestExtensionPatent = async (patentId: string) => {
        const { hash } = await writeContract({
            address: MANAGEMENT_CONTRACT_ADDRESS,
            abi: PatentManagement.abi,
            functionName: "requestExtension",
            args: [patentId],
        });
    };

    const renderAdminActionsPatent = () => {
        switch (currentPatent.status) {
            case State.Pending:
                return (
                    <div
                        style={{
                            gap: 4,
                            border: "1px solid black",
                        }}
                    >
                        <button
                            onClick={async () =>
                                await handleSetPatentState(
                                    currentPatent.id,
                                    State.Granted
                                )
                            }
                        >
                            Grant patent
                        </button>
                        <button
                            onClick={async () =>
                                await handleSetPatentState(
                                    currentPatent.id,
                                    State.Rejected
                                )
                            }
                        >
                            Revoke patent
                        </button>
                        {hasCurrentPatentExtensionRequest && (
                            <>
                                <button
                                    onClick={async () =>
                                        await handleExtendExpirationState(
                                            currentPatent.id,
                                            State.Granted
                                        )
                                    }
                                >
                                    Grant extension
                                </button>
                                <button
                                    onClick={async () =>
                                        await handleExtendExpirationState(
                                            currentPatent.id,
                                            State.Rejected
                                        )
                                    }
                                >
                                    Revoke extension
                                </button>
                            </>
                        )}
                    </div>
                );

            case State.Granted:
                return (
                    <div
                        style={{
                            gap: 4,
                            border: "1px solid black",
                        }}
                    >
                        <button
                            onClick={async () =>
                                await handleSetPatentState(
                                    currentPatent.id,
                                    State.Rejected
                                )
                            }
                        >
                            Revoke patent
                        </button>
                        {hasCurrentPatentExtensionRequest && (
                            <>
                                <button
                                    onClick={async () =>
                                        await handleExtendExpirationState(
                                            currentPatent.id,
                                            State.Granted
                                        )
                                    }
                                >
                                    Grant extension
                                </button>
                                <button
                                    onClick={async () =>
                                        await handleExtendExpirationState(
                                            currentPatent.id,
                                            State.Rejected
                                        )
                                    }
                                >
                                    Revoke extension
                                </button>
                            </>
                        )}
                    </div>
                );
            case State.Rejected:
                return (
                    <div
                        style={{
                            gap: 4,
                            border: "1px solid black",
                        }}
                    >
                        <button
                            onClick={async () =>
                                await handleSetPatentState(
                                    currentPatent.id,
                                    State.Granted
                                )
                            }
                        >
                            Grant patent
                        </button>
                    </div>
                );

            default:
                return <></>;
        }
    };

    const renderUserActionsPatent = () => {
        switch (currentPatent.status) {
            case State.Pending:
                return extensionRequestNotInitiated ? (
                    <button
                        onClick={async () =>
                            await handleRequestExtensionPatent(currentPatent.id)
                        }
                    >
                        Request extension
                    </button>
                ) : (
                    <></>
                );

            case State.Granted:
                return extensionRequestNotInitiated ? (
                    <button
                        onClick={async () =>
                            await handleRequestExtensionPatent(currentPatent.id)
                        }
                    >
                        Request extension
                    </button>
                ) : (
                    <></>
                );

            default:
                return <></>;
        }
    };

    return (
        <div>
            <h1>
                {currentPatent.title}
                {hasCurrentPatentExtensionRequest
                    ? " - extension requested"
                    : ""}
            </h1>
            <h3>{currentPatent.id}</h3>
            <h3>Owner address: {currentPatent.owner}</h3>
            <h3>
                Expiration date:
                {moment
                    .unix(+currentPatent.expirationDate.toString())
                    .format("MMM Do YYYY")}
            </h3>
            {currentUser?.isAdmin
                ? renderAdminActionsPatent()
                : renderUserActionsPatent()}
        </div>
    );
};

export default Patent;
