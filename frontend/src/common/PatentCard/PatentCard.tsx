import React from "react";
import { shortPatentTitle, shortenAddress } from "../../utils/blockchainUtils";
import { CustomColors } from "../../utils/constants";

type PatentCardProps = {
    title: string;
    id: string;
    expirationDate: string;
    cardColor?: string;
    owner?: string;
    hasPendingRequest?: boolean;
    onClick: () => void;
};

const PatentCard: React.FC<PatentCardProps> = ({
    title,
    id,
    owner,
    expirationDate,
    cardColor,
    hasPendingRequest,
    onClick,
}) => {
    return (
        <button
            onClick={onClick}
            style={{
                width: "320px !important",
                backgroundColor: cardColor ?? CustomColors.DefaultGrey,
                border: hasPendingRequest ? "2px solid #f3cc30" : "",
            }}
            className="flex flex-col rounded-box bg-base-100 p-6"
        >
            <div className="text-2xl font-extrabold">
                {shortPatentTitle(title)}
            </div>

            <div className="text-md font-bold pb-6 ">{shortenAddress(id)}</div>
            <div
                style={{ visibility: owner ? "visible" : "hidden" }}
                className=" text-sm font-semibold"
            >{`Owner - ${shortenAddress(owner ?? "", true)}`}</div>
            <div className=" text-sm font-semibold">{expirationDate}</div>
        </button>
    );
};

export default PatentCard;
