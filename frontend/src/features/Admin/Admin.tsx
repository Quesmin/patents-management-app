import { useNavigate } from "react-router-dom";
import PatentCard from "../../common/PatentCard/PatentCard";
import useBlockchainPatentsSync from "../../hooks/useBlockchainPatents";
import { State } from "../../types/Common";
import { BlockchainPatent } from "../../types/Patent";
import { CustomColors } from "../../utils/constants";
import { convertUnixToDateFormat } from "../../utils/dataUtils";

const Admin = () => {
    const navigate = useNavigate();

    const blockchainPatents = useBlockchainPatentsSync();

    const drafts = blockchainPatents.filter((p) => p.status === State.Pending);
    const granteds = blockchainPatents.filter(
        (p) => p.status === State.Granted
    );
    const revoked = blockchainPatents.filter(
        (p) => p.status === State.Rejected
    );

    const renderPatentSection = (
        sectionTitle: string,
        patentCardsColor: string,
        patents: BlockchainPatent[]
    ) => {
        if (patents.length === 0) {
            return <></>;
        }

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
                            owner={p.owner}
                            cardColor={patentCardsColor}
                            expirationDate={convertUnixToDateFormat(
                                +p.expirationDate.toString()
                            )}
                            hasPendingRequest={
                                p.expirationExtension === State.Pending
                            }
                            onClick={() => navigate("/admin/" + p.id)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex items-start flex-col px-8 w-full">
            <div className=" font-bold text-2xl py-8">Admin Dashboard</div>

            {renderPatentSection("Drafts", CustomColors.Blue, drafts)}
            {renderPatentSection("Granted", CustomColors.Green, granteds)}
            {renderPatentSection("Revoked", CustomColors.Red, revoked)}
        </div>
    );
};

export default Admin;
