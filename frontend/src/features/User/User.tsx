import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PatentCard, {
    PatentCardColor,
} from "../../common/PatentCard/PatentCard";
import useBlockchainPatents from "../../hooks/useBlockchainPatents";
import useLicensedPatents from "../../hooks/useLicensedPatents";
import { useAppSelector } from "../../state/store";
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

const User = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const currentAccount = useAppSelector(
        (state) => state.account.currentAccount
    );
    const navigate = useNavigate();
    const blockchainPatents = useBlockchainPatents();
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
        if (!patentFile) return;

        const ipfsHash = await submitToIpfsCall(patentFile);

        if (!ipfsHash) return;

        const receipt = await writeAction(
            [title, ipfsHash],
            "submitDraftPatent",
            "3"
        );

        if (!receipt || !receipt.status) {
            await removeFromIpfsCall(ipfsHash);
        }
    };

    const renderPatentSection = (
        sectionTitle: string,
        patents:
            | BlockchainPatent[]
            | PersonalPatentsWithRoyaltyContracts[]
            | LicensedContractWithPatentData[],
        patentsCardColor?: PatentCardColor
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
                    PatentCardColor.Blue
                )}
                {renderPatentSection(
                    "Granted",
                    myGrantedPatentsWithContracts,
                    PatentCardColor.Green
                )}
                {renderPatentSection(
                    "Revoked",
                    myRevokedPatents,
                    PatentCardColor.Red
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
