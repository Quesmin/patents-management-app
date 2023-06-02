import moment from "moment";
import React from "react";
import Web3 from "web3";
import { RoyaltyContractData } from "../../../types/Patent";
import { writeAction } from "../../../utils/blockchainUtils";

type RoyaltyContractModalProps = {
    selectedContract: RoyaltyContractData | null;
    isReadOnly?: boolean;
    onClose: () => void;
};

const RoyaltyContractModal: React.FC<RoyaltyContractModalProps> = ({
    selectedContract,
    isReadOnly,
    onClose,
}) => {
    const web3 = new Web3();

    const handleContractValidityCheck = async () => {
        if (!selectedContract) return;

        const receipt = await writeAction(
            [selectedContract.patentId, selectedContract.licensee],
            "checkValidityOfRoyaltyContract"
        );

        if (!receipt || !receipt.status) {
            alert("Failed to check validity of royalty contract");
            return;
        }

        onClose();

        alert(
            "Successfully checked validity of royalty contract. If the contract is invalid, it will be deleted."
        );
    };

    if (!selectedContract) {
        return <></>;
    }

    return (
        <div style={{ ...modalStyle, position: "fixed" }}>
            <div style={{ ...modalContentStyle }}>
                <div style={{ display: "flex" }}>
                    <h2>Royalty Contract</h2>
                    <h2 onClick={() => onClose()}>X</h2>
                </div>
                <div>
                    <div>Licensee address: {selectedContract.licensee}</div>
                    <div>
                        Royalty contract address:{" "}
                        {selectedContract.contractAddress}
                    </div>
                    <div>
                        Royalty fee:{" "}
                        {web3.utils.fromWei(
                            selectedContract.royaltyFee.toString()
                        )}
                    </div>
                    <div>
                        {/*TODO: divide by MONTH_IN_SECONDS */}
                        Payment Interval (Months):{" "}
                        {+selectedContract.paymentInterval.toString() / 60}
                    </div>
                    <div>
                        Contract Expiration Date:{" "}
                        {moment
                            .unix(+selectedContract.expirationDate.toString())
                            .format("MMM Do YYYY HH:mm")}
                    </div>
                </div>
                {!isReadOnly && (
                    <div>
                        <button
                            onClick={async () =>
                                await handleContractValidityCheck()
                            }
                        >
                            Run validity check on contract
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const modalStyle = {
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
};

const modalContentStyle = {
    background: "#fff",
    padding: "20px",
};

export default RoyaltyContractModal;
