import moment from "moment";
import { useRef, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useContractWrite } from "wagmi";
import { writeContract } from "wagmi/actions";
import Web3 from "web3";
import { useAppSelector } from "../../state/store";
import { State } from "../../types/Common";
import {
    LicensedContractWithPatentData,
    RoyaltyContractData,
} from "../../types/Patent";
import { transactionAction, writeAction } from "../../utils/blockchainUtils";
import { openInNewTab } from "../User/User";
import config from "./../../../config";
import PatentManagement from "./../../abis/PatentManagement.json";
import LicenseOrganizationModal from "./LicenseOrganizationModal/LicenseOrganizationModal";
import RoyaltyContractModal from "./RoyaltyContractModal/RoyaltyContractModal";

const Patent = () => {
    const web3 = new Web3();
    const location = useLocation();
    const [isLicenseOrgModalOpen, setIsLicenseOrgModalOpen] = useState(false);
    const [isRoyaltyContractModalOpen, setIsRoyaltyContractModalOpen] =
        useState(false);
    const selectedPersonalRoyaltyContract = useRef<RoyaltyContractData | null>(
        null
    );
    const currentUser = useAppSelector((state) => state.account.currentAccount);
    const { id: currentPatentId } = useParams();
    const patents = useAppSelector((state) => state.patent.patents);
    const currentPatent = patents.find((p) => p.id === currentPatentId);
    const hasCurrentPatentExtensionRequest =
        currentPatent?.expirationExtension === State.Pending;
    const extensionRequestNotInitiated =
        currentPatent?.expirationExtension === State.NotStarted;

    const royaltyContract = location.state?.royaltyContract as
        | LicensedContractWithPatentData
        | undefined;

    const patentRoyaltyContracts = location.state?.royaltyContracts as
        | RoyaltyContractData[]
        | undefined;

    const { data: royaltyContractAddress } = useContractWrite({
        address: config.PATENT_MANAGEMENT_CONTRACT_ADDRESS,
        abi: PatentManagement.abi,
        functionName: "getContractAddressForLicensee",
        args: [currentPatentId, currentUser?.address],
    });

    if (!currentPatent) {
        return <Navigate to="/not-found" />;
    }

    const handleSetPatentState = async (patentId: string, newState: State) => {
        const { _hash } = await writeContract({
            address: config.PATENT_MANAGEMENT_CONTRACT_ADDRESS,
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
            address: config.PATENT_MANAGEMENT_CONTRACT_ADDRESS,
            abi: PatentManagement.abi,
            functionName: "handlePatentExtensionRequest",
            args: [patentId, newState],
        });
    };

    const handleRequestExtensionPatent = async (patentId: string) => {
        const { hash } = await writeContract({
            address: config.PATENT_MANAGEMENT_CONTRACT_ADDRESS,
            abi: PatentManagement.abi,
            functionName: "requestExtension",
            args: [patentId],
        });
    };

    const handleRoyaltyContractClick = (contract: RoyaltyContractData) => {
        selectedPersonalRoyaltyContract.current = contract;
        setIsRoyaltyContractModalOpen(true);
    };

    const getIsContracValid = () => {
        if (!royaltyContract) return false;

        const now = moment().unix();
        // console.log("🚀 ~ file: Patent.tsx:96 ~ getIsContracValid ~ now:", now);
        // console.log(
        //     "🚀 ~ file: Patent.tsx:100 ~ getIsContracValid ~ +royaltyContract.expirationDate.toString():",
        //     +royaltyContract.expirationDate.toString()
        // );
        // console.log(
        //     "🚀 ~ file: Patent.tsx:102 ~ getIsContracValid ~ +royaltyContract.paidUntil.toString():",
        //     +royaltyContract.paidUntil.toString()
        // );

        return (
            now < +royaltyContract.expirationDate.toString() ||
            now < +royaltyContract.paidUntil.toString()
        );
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
                return (
                    <div
                        style={{
                            gap: 4,
                            border: "1px solid black",
                        }}
                    >
                        {extensionRequestNotInitiated && (
                            <button
                                onClick={async () =>
                                    await handleRequestExtensionPatent(
                                        currentPatent.id
                                    )
                                }
                            >
                                Request extension
                            </button>
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
                        {extensionRequestNotInitiated && (
                            <button
                                onClick={async () =>
                                    await handleRequestExtensionPatent(
                                        currentPatent.id
                                    )
                                }
                            >
                                Request extension
                            </button>
                        )}
                        <button
                            // onClick={async () =>
                            //     await handleRequestExtensionPatent(
                            //         currentPatent.id
                            //     )
                            // }
                            onClick={() => setIsLicenseOrgModalOpen(true)}
                        >
                            License organization (create royalty contract)
                        </button>
                    </div>
                );

            default:
                return <></>;
        }
    };
    const renderLicenseeActionsPatent = () => {
        return (
            <div
                style={{
                    gap: 4,
                    border: "1px solid black",
                }}
            >
                {!royaltyContract ? (
                    <Navigate to="/user" />
                ) : getIsContracValid() ? (
                    royaltyContract.paused ? (
                        <button
                            onClick={async () => {
                                const receipt = await writeAction(
                                    [currentPatent.id],
                                    "approveRoyaltyContract"
                                );

                                if (!receipt || !receipt.status) {
                                    alert(
                                        "Transaction failed. Check Metamask."
                                    );
                                }
                            }}
                        >
                            Approve contract
                        </button>
                    ) : (
                        <button
                            onClick={async () => {
                                const receipt = await transactionAction(
                                    royaltyContract.contractAddress,
                                    web3.utils.fromWei(
                                        royaltyContract.royaltyFee.toString()
                                    )
                                );

                                if (!receipt || !receipt.status) {
                                    alert(
                                        "Transaction failed. Check Metamask."
                                    );
                                }
                            }}
                        >
                            {`Pay royalty fee (${web3.utils.fromWei(
                                royaltyContract.royaltyFee.toString()
                            )} ETH)`}
                        </button>
                    )
                ) : (
                    <div>Contract expired</div>
                )}
            </div>
        );

        //     case State.Granted:
        //         return (
        //             <div
        //                 style={{
        //                     gap: 4,
        //                     border: "1px solid black",
        //                 }}
        //             >
        //                 {extensionRequestNotInitiated && (
        //                     <button
        //                         onClick={async () =>
        //                             await handleRequestExtensionPatent(
        //                                 currentPatent.id
        //                             )
        //                         }
        //                     >
        //                         Request extension
        //                     </button>
        //                 )}
        //                 <button
        //                     // onClick={async () =>
        //                     //     await handleRequestExtensionPatent(
        //                     //         currentPatent.id
        //                     //     )
        //                     // }
        //                     onClick={() => setIsLicenseOrgModalOpen(true)}
        //                 >
        //                     License organization (create royalty contract)
        //                 </button>
        //             </div>
        //         );

        //     default:
        //         return <></>;
        // }
    };

    return (
        <>
            <div>
                <h1>
                    {currentPatent.title}
                    {hasCurrentPatentExtensionRequest
                        ? " - extension requested"
                        : ""}
                </h1>
                <h3>{currentPatent.id}</h3>
                <h3>Owner address: {currentPatent.owner}</h3>
                {royaltyContract && (
                    <h3>
                        Royalty Contract address:
                        {royaltyContract.contractAddress}
                    </h3>
                )}
                <h3>
                    Expiration date:
                    {moment
                        .unix(+currentPatent.expirationDate.toString())
                        .format("MMM Do YYYY HH:mm")}
                </h3>
                {royaltyContract && (
                    <div>
                        <h3>
                            Paid until:{" "}
                            {moment
                                .unix(+royaltyContract.paidUntil.toString())
                                .format("MMM Do YYYY HH:mm")}
                        </h3>

                        <h3>
                            Expiration date:{" "}
                            {moment
                                .unix(
                                    +royaltyContract.expirationDate.toString()
                                )
                                .format("MMM Do YYYY HH:mm")}
                        </h3>
                    </div>
                )}
                <div style={{ border: "1px solid black" }}>
                    <button
                        onClick={() =>
                            openInNewTab(
                                `${config.IPFS_GATEWAY}/${currentPatent.ipfsHash}`
                            )
                        }
                    >
                        View document
                    </button>
                </div>

                {currentUser?.isAdmin
                    ? renderAdminActionsPatent()
                    : royaltyContract
                    ? renderLicenseeActionsPatent()
                    : renderUserActionsPatent()}
                {patentRoyaltyContracts && (
                    <div style={{ paddingTop: 48 }}>
                        <h1>Royalty contracts</h1>
                        <h2 style={{ paddingTop: 20 }}>Valid</h2>
                        <div>
                            {patentRoyaltyContracts
                                .filter((c) => c.paused === false)
                                .map((c) => (
                                    <div
                                        style={{ paddingBottom: 8 }}
                                        key={c.contractAddress}
                                        onClick={() =>
                                            handleRoyaltyContractClick(c)
                                        }
                                    >
                                        <h3>
                                            Contract address:{" "}
                                            {c.contractAddress}
                                        </h3>
                                        <h3>Licensee address: {c.licensee}</h3>
                                        <h3>
                                            Royalty fee:{" "}
                                            {web3.utils.fromWei(
                                                c.royaltyFee.toString()
                                            )}{" "}
                                            ETH
                                        </h3>
                                        <h3>
                                            Expiration date:{" "}
                                            {moment
                                                .unix(
                                                    +c.expirationDate.toString()
                                                )
                                                .format("MMM Do YYYY HH:mm")}
                                        </h3>
                                    </div>
                                ))}
                        </div>
                        <h2 style={{ paddingTop: 20 }}>Pending</h2>
                        <div>
                            {patentRoyaltyContracts
                                .filter((c) => c.paused === true)
                                .map((c) => (
                                    <div
                                        style={{ paddingBottom: 8 }}
                                        key={c.contractAddress}
                                        onClick={() =>
                                            handleRoyaltyContractClick(c)
                                        }
                                    >
                                        <h3>
                                            Contract address:{" "}
                                            {c.contractAddress}
                                        </h3>
                                        <h3>Licensee address: {c.licensee}</h3>
                                        <h3>
                                            Royalty fee:{" "}
                                            {web3.utils.fromWei(
                                                c.royaltyFee.toString()
                                            )}{" "}
                                            ETH
                                        </h3>
                                        <h3>
                                            Expiration date:{" "}
                                            {moment
                                                .unix(
                                                    +c.expirationDate.toString()
                                                )
                                                .format("MMM Do YYYY HH:mm")}
                                        </h3>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
            {isLicenseOrgModalOpen && (
                <LicenseOrganizationModal
                    currentPatentId={currentPatent.id}
                    onClose={() => setIsLicenseOrgModalOpen(false)}
                />
            )}
            {isRoyaltyContractModalOpen && (
                <RoyaltyContractModal
                    key={JSON.stringify(
                        selectedPersonalRoyaltyContract.current
                    )}
                    isReadOnly={selectedPersonalRoyaltyContract.current?.paused}
                    selectedContract={selectedPersonalRoyaltyContract.current}
                    onClose={() => setIsRoyaltyContractModalOpen(false)}
                />
            )}
        </>
    );
};

export default Patent;
