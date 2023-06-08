import moment from "moment";
import { useRef, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useContractWrite } from "wagmi";
import { writeContract } from "wagmi/actions";
import Web3 from "web3";
import clockFilledIcon from "../../assets/clock-filled.svg";
import userFilledIcon from "../../assets/user-filled.svg";
import { useAppSelector } from "../../state/store";
import { State } from "../../types/Common";
import {
    LicensedContractWithPatentData,
    RoyaltyContractData,
} from "../../types/Patent";
import { transactionAction, writeAction } from "../../utils/blockchainUtils";
import {
    convertUnixToDateFormat,
    getIsContracValid,
    openInNewTab,
} from "../../utils/dataUtils";
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
        currentPatent?.expirationExtension === State.Pending &&
        currentPatent.status === State.Pending;
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

    const renderAdminContent = () => {
        const getAdminActions = () => {
            switch (currentPatent.status) {
                case State.Pending:
                    return (
                        <div className="flex gap-4">
                            <button
                                className="btn btn-success capitalize w-40"
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
                                className="btn btn-error capitalize w-40"
                                onClick={async () =>
                                    await handleSetPatentState(
                                        currentPatent.id,
                                        State.Rejected
                                    )
                                }
                            >
                                Revoke patent
                            </button>
                        </div>
                    );

                case State.Granted:
                    return (
                        <div className="flex gap-4">
                            <button
                                className="btn btn-error capitalize w-40"
                                onClick={async () =>
                                    await handleSetPatentState(
                                        currentPatent.id,
                                        State.Rejected
                                    )
                                }
                            >
                                Revoke patent
                            </button>
                        </div>
                    );
                case State.Rejected:
                    return (
                        <div className="flex gap-4">
                            <button
                                className="btn btn-success capitalize w-40"
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

        return (
            <div className="flex flex-col items-start w-full">
                <div className="flex flex-col items-start pb-10">
                    <div className="uppercase pb-2 font-black text-base text-gray-300">
                        Main Actions
                    </div>
                    {getAdminActions()}
                </div>
                {hasCurrentPatentExtensionRequest && (
                    <div className="flex flex-col items-start pb-10">
                        <div className="uppercase pb-2 font-black text-base text-gray-300">
                            Patent Expiration date extension
                        </div>
                        <div className="flex gap-4">
                            <button
                                className="btn btn-success capitalize w-40"
                                onClick={async () =>
                                    await handleExtendExpirationState(
                                        currentPatent.id,
                                        State.Granted
                                    )
                                }
                            >
                                Approve
                            </button>
                            <button
                                className="btn btn-error capitalize w-40"
                                onClick={async () =>
                                    await handleExtendExpirationState(
                                        currentPatent.id,
                                        State.Rejected
                                    )
                                }
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
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
                        <button onClick={() => setIsLicenseOrgModalOpen(true)}>
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
                ) : getIsContracValid(royaltyContract) ? (
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
    };

    return (
        <div className="flex flex-col items-start p-8">
            <div className="flex flex-col items-start">
                <h1 className="text-6xl font-extrabold">
                    {currentPatent.title}
                </h1>
                <h3 className="text-2xl font-bold text-gray-300 pt-2">
                    {currentPatent.id}
                </h3>

                <div className="flex items-center gap-2 text-lg font-bold text-gray-300 pt-10">
                    <img src={userFilledIcon} />
                    {currentPatent.owner}
                </div>

                <div className="flex items-center gap-2 text-lg font-bold text-gray-300 pt-2">
                    <img src={clockFilledIcon} />
                    {convertUnixToDateFormat(
                        +currentPatent.expirationDate.toString()
                    )}
                </div>

                <button
                    className="btn btn-secondary capitalize mt-6 mb-8 w-40"
                    onClick={() =>
                        openInNewTab(
                            `${config.IPFS_GATEWAY}/${currentPatent.ipfsHash}`
                        )
                    }
                >
                    View document
                </button>
            </div>

            <div>
                {royaltyContract && (
                    <h3>
                        Royalty Contract address:
                        {royaltyContract.contractAddress}
                    </h3>
                )}

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

                {currentUser?.isAdmin
                    ? renderAdminContent()
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
            <LicenseOrganizationModal
                isShown={isLicenseOrgModalOpen}
                currentPatentId={currentPatent.id}
                onClose={() => setIsLicenseOrgModalOpen(false)}
            />
            <RoyaltyContractModal
                key={JSON.stringify(selectedPersonalRoyaltyContract.current)}
                isShown={isRoyaltyContractModalOpen}
                isReadOnly={selectedPersonalRoyaltyContract.current?.paused}
                selectedContract={selectedPersonalRoyaltyContract.current}
                onClose={() => setIsRoyaltyContractModalOpen(false)}
            />
        </div>
    );
};

export default Patent;
