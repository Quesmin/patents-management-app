import React from "react";
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

const User = () => {
    const currentAccount = useAppSelector(
        (state) => state.account.currentAccount
    );
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const [patentTitle, setPatentTitle] = React.useState("");
    const [patentFile, setPatentFile] = React.useState<File | null>(null);

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
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
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
                    ref={fileInputRef}
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
        </div>
    );
};

export default User;
