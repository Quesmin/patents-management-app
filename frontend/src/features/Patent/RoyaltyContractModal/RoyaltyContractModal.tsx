import moment from "moment";
import React from "react";
import Web3 from "web3";
import { RoyaltyContractData } from "../../../types/Patent";
import { writeAction } from "../../../utils/blockchainUtils";
import Modal, { ModalProps } from "../../../common/Modal/Modal";

type RoyaltyContractModalProps = {
    selectedContract: RoyaltyContractData | null;
    isReadOnly?: boolean;
} & ModalProps;

const RoyaltyContractModal: React.FC<RoyaltyContractModalProps> = ({
    selectedContract,
    isReadOnly,
    onClose,
    isShown,
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
        <Modal isShown={isShown} onClose={onClose}>
            <div className="flex flex-col py-8 px-4 items-center gap-4">
                <h3 className="font-bold text-lg mb-4">Royalty Contract</h3>

                <div className="form-control w-full max-w-lg">
                    <label className="label">
                        <span className="label-text">Licensee Address</span>
                    </label>
                    <input
                        className="input input-bordered w-full max-w-lg"
                        disabled
                        type="text"
                        value={selectedContract.licensee}
                    />
                </div>

                <div className="form-control w-full max-w-lg">
                    <label className="label">
                        <span className="label-text">
                            Royalty Contract Address
                        </span>
                    </label>
                    <input
                        className="input input-bordered w-full max-w-lg"
                        disabled
                        type="text"
                        value={selectedContract.contractAddress}
                    />
                </div>
                <div className="form-control w-full max-w-lg">
                    <label className="label">
                        <span className="label-text">Royalty Fee (ETH)</span>
                    </label>
                    <input
                        className="input input-bordered w-full max-w-lg"
                        disabled
                        type="text"
                        value={web3.utils.fromWei(
                            selectedContract.royaltyFee.toString()
                        )}
                    />
                </div>
                <div className="form-control w-full max-w-lg">
                    <label className="label">
                        <span className="label-text">
                            Payment Interval (Months)
                        </span>
                    </label>
                    <input
                        className="input input-bordered w-full max-w-lg"
                        disabled
                        type="text"
                        //*TODO: divide by MONTH_IN_SECONDS
                        value={
                            +selectedContract.paymentInterval.toString() / 60
                        }
                    />
                </div>
                <div className="form-control w-full max-w-lg">
                    <label className="label">
                        <span className="label-text">
                            Contract Expiration Date
                        </span>
                    </label>
                    <input
                        className="input input-bordered w-full max-w-lg"
                        disabled
                        type="text"
                        value={moment
                            .unix(+selectedContract.expirationDate.toString())
                            .format("MMM Do YYYY HH:mm")}
                    />
                </div>

                {!isReadOnly && (
                    <button
                        className="btn btn-secondary w-full max-w-lg mt-8 capitalize"
                        onClick={async () =>
                            await handleContractValidityCheck()
                        }
                    >
                        Run validity check
                    </button>
                )}
            </div>
        </Modal>
    );
};

export default RoyaltyContractModal;
