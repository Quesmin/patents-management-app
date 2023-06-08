import React from "react";
import contractFilledIcon from "./../../assets/contract-filled.svg";
import userFilledIcon from "./../../assets/user-filled.svg";
import { shortenAddress } from "../../utils/blockchainUtils";
import { CustomColors } from "../../utils/constants";

type RoyaltyContractCardProps = {
    contractAddress: string;
    licenseeAddress: string;
    royaltyFee: string;
    expirationDate: string;
    isValid?: boolean;
    onClick?: () => void;
};

const RoyaltyContractCard: React.FC<RoyaltyContractCardProps> = ({
    contractAddress,
    licenseeAddress,
    royaltyFee,
    expirationDate,
    isValid = false,
    onClick,
}) => {
    return (
        <button
            style={{
                backgroundColor: isValid
                    ? CustomColors.Green
                    : CustomColors.DefaultGrey,
            }}
            className="flex flex-col rounded-box bg-base-100 p-6"
            onClick={onClick}
        >
            <div className="flex items-center justify-between gap-2 text-lg font-semibold w-full">
                <img src={contractFilledIcon} />{" "}
                {shortenAddress(contractAddress)}
            </div>

            <div className="flex items-center justify-between gap-2 text-lg font-semibold w-full">
                <img src={userFilledIcon} style={{ height: "1.25em" }} />{" "}
                {shortenAddress(licenseeAddress)}
            </div>

            <div className="flex items-center text-sm pt-6 font-semibold w-full justify-between">
                <div>{`${royaltyFee} ETH`}</div>
                <div>{expirationDate}</div>
            </div>
        </button>
    );
};

export default RoyaltyContractCard;
