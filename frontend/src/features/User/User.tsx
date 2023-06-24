import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PatentCard from "../../common/PatentCard/PatentCard";
import useBlockchainPatentsSync from "../../hooks/useBlockchainPatents";
import useLicensedPatents from "../../hooks/useLicensedPatents";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { State } from "../../types/Common";
import {
    BlockchainPatent,
    LicensedContractWithPatentData,
    PersonalPatentsWithRoyaltyContracts,
} from "../../types/Patent";
import {
    areAddressesEqual,
    removeFromIpfsCall,
    submitToIpfsCall,
    writeAction,
} from "../../utils/blockchainUtils";
import { CustomColors, INFO_MODAL_MESSAGE } from "../../utils/constants";
import {
    convertUnixToDateFormat,
    getIsContracValid,
    getLicensedPatentsAndContractsForCurrentUser,
    getPersonalGrantedPatentsWithRoyaltyContracts,
} from "../../utils/dataUtils";
import {
    isBlockchainPatentArray,
    isLicensedContractWithPatentDataArray,
    isPersonalPatentsWithRoyaltyContractsArray,
} from "../../utils/guardUtils";
import SubmitDraftModal from "./SubmitDraftModal/SubmitDraftModal";
import {
    setErrorAlertMessage,
    setInfoModalMessage,
    setIsLoading,
} from "../../state/notification/slice";

const User = () => {
    const dispatch = useAppDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const currentAccount = useAppSelector(
        (state) => state.account.currentAccount
    );
    const navigate = useNavigate();
    const blockchainPatents = useBlockchainPatentsSync();
    const licensedPatents = useLicensedPatents();

    const myGrantedPatentsWithContracts =
        getPersonalGrantedPatentsWithRoyaltyContracts(
            blockchainPatents,
            licensedPatents,
            currentAccount?.address
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

    const handleSubmitPatent = async (
        title: string,
        patentFile: File | null
    ) => {
        dispatch(setIsLoading(true));
        if (!patentFile) {
            dispatch(setErrorAlertMessage("No patent document available!"));
            dispatch(setIsLoading(false));
            return;
        }

        const ipfsHash = await submitToIpfsCall(patentFile);

        if (!ipfsHash) {
            dispatch(setErrorAlertMessage("Error creating the IPFS hash!"));
            dispatch(setIsLoading(false));
            return;
        }

        const receipt = await writeAction(
            [title, ipfsHash],
            "submitDraftPatent",
            "3"
        );

        if (!receipt || !receipt.status) {
            dispatch(
                setErrorAlertMessage("Could not upload the patent draft!")
            );
            await removeFromIpfsCall(ipfsHash);
        } else {
            dispatch(setInfoModalMessage(INFO_MODAL_MESSAGE));
        }

        dispatch(setIsLoading(false));
    };

    const renderPatentSection = (
        sectionTitle: string,
        patents:
            | BlockchainPatent[]
            | PersonalPatentsWithRoyaltyContracts[]
            | LicensedContractWithPatentData[],
        patentsCardColor?: string
    ) => {
        if (patents.length === 0) {
            return <></>;
        }

        if (isBlockchainPatentArray(patents)) {
            return (
                <div className="flex flex-col items-start w-full">
                    <div className="uppercase pb-6 font-black text-base text-gray-300">
                        {sectionTitle}
                    </div>
                    <div className="gap-6 pb-6 flex w-full overflow-auto">
                        {patents.map((p) => (
                            <PatentCard
                                key={p.id}
                                title={p.title}
                                id={p.id}
                                cardColor={patentsCardColor}
                                expirationDate={convertUnixToDateFormat(
                                    +p.expirationDate.toString()
                                )}
                                onClick={() => navigate("/user/" + p.id)}
                            />
                        ))}
                    </div>
                </div>
            );
        }
        if (isPersonalPatentsWithRoyaltyContractsArray(patents)) {
            return (
                <div className="flex flex-col items-start w-full">
                    <div className="uppercase pb-6 font-black text-base text-gray-300">
                        {sectionTitle}
                    </div>
                    <div className="gap-6 pb-6 flex w-full overflow-auto">
                        {patents.map((p) => (
                            <PatentCard
                                key={p.patent.id}
                                title={p.patent.title}
                                id={p.patent.id}
                                cardColor={patentsCardColor}
                                expirationDate={convertUnixToDateFormat(
                                    +p.patent.expirationDate.toString()
                                )}
                                onClick={() =>
                                    navigate("/user/" + p.patent.id, {
                                        state: {
                                            royaltyContracts:
                                                p.royaltyContracts,
                                        },
                                    })
                                }
                            />
                        ))}
                    </div>
                </div>
            );
        }
        if (isLicensedContractWithPatentDataArray(patents)) {
            return (
                <div className="flex flex-col items-start w-full">
                    <div className="uppercase pb-6 font-black text-base text-gray-300">
                        {sectionTitle}
                    </div>
                    <div className="gap-6 pb-6 flex w-full overflow-auto">
                        {patents.map((p) => (
                            <PatentCard
                                key={p.patent.id}
                                title={p.patent.title}
                                id={p.patent.id}
                                owner={p.patent.owner}
                                cardColor={patentsCardColor}
                                expirationDate={convertUnixToDateFormat(
                                    +p.expirationDate.toString()
                                )}
                                hasPendingRequest={
                                    getIsContracValid(p) && p.paused
                                }
                                onClick={() =>
                                    navigate("/user/" + p.patent.id, {
                                        state: {
                                            royaltyContract: p,
                                        },
                                    })
                                }
                            />
                        ))}
                    </div>
                </div>
            );
        }

        return <></>;
    };

    return (
        <div className="flex items-start flex-col px-8 w-full">
            <div className=" font-bold text-2xl py-8">User Dashboard</div>

            <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-neutral capitalize mb-6"
            >
                Submit Draft Patent
            </button>

            <div>
                {renderPatentSection(
                    "Draft",
                    myDraftPatents,
                    CustomColors.Blue
                )}
                {renderPatentSection(
                    "Granted",
                    myGrantedPatentsWithContracts,
                    CustomColors.Green
                )}
                {renderPatentSection(
                    "Revoked",
                    myRevokedPatents,
                    CustomColors.Red
                )}
                {renderPatentSection("Licensed", licensedPatentsWithContracts)}
            </div>
            <SubmitDraftModal
                isShown={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmitDraft={handleSubmitPatent}
            />
        </div>
    );
};

export default User;
