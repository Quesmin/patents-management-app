import React, { useState } from "react";
import { writeAction } from "../../../utils/blockchainUtils";
import { parseEther } from "viem";
import Modal, { ModalProps } from "../../../common/Modal/Modal";

type LicenseOrganizationModalProps = {
    currentPatentId: string;
} & ModalProps;

const LicenseOrganizationModal: React.FC<LicenseOrganizationModalProps> = ({
    currentPatentId,
    onClose,
    isShown,
}) => {
    const [organizationAddress, setOrganizationAddress] = useState("");
    const [royaltyFee, setRoyaltyFee] = useState(0);
    const [paymentIntervalMonths, setPaymentIntervalMonths] = useState(0);
    const [expirationDate, setExpirationDate] = useState("");

    const handleSubmit = async () => {
        const receipt = await writeAction(
            [
                currentPatentId,
                organizationAddress,
                parseEther(royaltyFee.toString() as `${number}`),
                //TODO: multiply by MONTH_IN_SECONDS
                paymentIntervalMonths * 60,
                Math.floor(new Date(expirationDate).getTime() / 1000),
            ],
            "createRoyaltyContract"
        );

        if (!receipt || !receipt.status) {
            alert("Failed to license organization");
            return;
        }

        setOrganizationAddress("");
        setRoyaltyFee(0);
        setPaymentIntervalMonths(0);
        setExpirationDate("");

        onClose();
    };

    return (
        <Modal isShown={isShown} onClose={onClose}>
            <div className="flex flex-col py-8 items-center gap-4">
                <h3 className="font-bold text-lg mb-4">License Organization</h3>

                <div className="form-control w-full max-w-lg">
                    <label className="label">
                        <span className="label-text">Organization Address</span>
                    </label>
                    <input
                        className="input input-bordered w-full max-w-lg"
                        type="text"
                        value={organizationAddress}
                        onChange={(e) => setOrganizationAddress(e.target.value)}
                    />
                </div>
                <div className="form-control w-full max-w-lg">
                    <label className="label">
                        <span className="label-text">Royalty Fee</span>
                    </label>

                    <input
                        className="input input-bordered w-full max-w-lg"
                        placeholder="Royalty Fee"
                        type="number"
                        value={royaltyFee}
                        onChange={(e) => {
                            const inputNumber = parseInt(e.target.value, 10);
                            if (!isNaN(inputNumber) && inputNumber >= 0) {
                                setRoyaltyFee(inputNumber);
                            }
                        }}
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
                        placeholder="Payment Interval (Months)"
                        type="number"
                        value={paymentIntervalMonths}
                        onChange={(e) => {
                            const inputNumber = parseInt(e.target.value, 10);
                            if (!isNaN(inputNumber) && inputNumber >= 0) {
                                setPaymentIntervalMonths(inputNumber);
                            }
                        }}
                    />
                </div>
                <div className="form-control w-full max-w-lg">
                    <label className="label">
                        <span className="label-text">Expiration Date</span>
                    </label>

                    <input
                        className="input input-bordered w-full max-w-lg"
                        type="datetime-local"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                    />
                </div>
                <button
                    className="btn btn-active btn-accent w-full max-w-lg mt-8 capitalize"
                    type="submit"
                    onClick={handleSubmit}
                >
                    Submit
                </button>
            </div>
            {/* </div>
            </div> */}
        </Modal>
    );
};

export default LicenseOrganizationModal;
