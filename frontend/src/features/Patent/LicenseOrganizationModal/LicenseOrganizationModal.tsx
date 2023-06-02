import React, { useState } from "react";
import { writeAction } from "../../../utils/blockchainUtils";
import { parseEther } from "viem";

export const DAY_IN_SECONDS = 86400;
export const MONTH_IN_SECONDS = 30 * DAY_IN_SECONDS;

type LicenseOrganizationModalProps = {
    currentPatentId: string;
    onClose: () => void;
};

const LicenseOrganizationModal: React.FC<LicenseOrganizationModalProps> = ({
    currentPatentId,
    onClose,
}) => {
    const [organizationAddress, setOrganizationAddress] = useState("");
    const [royaltyFee, setRoyaltyFee] = useState(0);
    const [paymentIntervalMonths, setPaymentIntervalMonths] = useState(0);
    const [expirationDate, setExpirationDate] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Perform validation or submit data to backend
        // ...

        // Reset input fields
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
        <div style={{ ...modalStyle, position: "fixed" }}>
            <div style={{ ...modalContentStyle }}>
                <div style={{ display: "flex" }}>
                    <h2>License Organization</h2>
                    <h2 onClick={() => onClose()}>X</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Organization Address:</label>
                        <input
                            type="text"
                            value={organizationAddress}
                            onChange={(e) =>
                                setOrganizationAddress(e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <label>Royalty Fee:</label>
                        <input
                            type="number"
                            value={royaltyFee}
                            onChange={(e) => {
                                const inputNumber = parseInt(
                                    e.target.value,
                                    10
                                );
                                if (!isNaN(inputNumber)) {
                                    setRoyaltyFee(inputNumber);
                                }
                            }}
                        />
                    </div>
                    <div>
                        <label>Payment Interval (Months):</label>
                        <input
                            type="number"
                            value={paymentIntervalMonths}
                            onChange={(e) => {
                                const inputNumber = parseInt(
                                    e.target.value,
                                    10
                                );
                                if (!isNaN(inputNumber)) {
                                    setPaymentIntervalMonths(inputNumber);
                                }
                            }}
                        />
                    </div>
                    <div>
                        <label>Expiration Date</label>
                        <input
                            type="datetime-local"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                        />
                    </div>
                    <button type="submit">License Organization</button>
                </form>
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

export default LicenseOrganizationModal;
