import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../state/store";
import {
    ERROR_ALERT_MESSAGE,
    EXPIRATION_ERROR_ALERT,
} from "../../utils/constants";
import { setErrorAlertMessage } from "../../state/notification/slice";

const ErrorAlert: React.FC = () => {
    const dispatch = useAppDispatch();
    const errorMessage = useAppSelector(
        (state) => state.notification.errorAlertMessage
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            dispatch(setErrorAlertMessage(""));
        }, EXPIRATION_ERROR_ALERT);
        return () => clearTimeout(timeoutId);
    }, [dispatch]);

    return (
        <div className="fixed z-30 top-12 left-36 right-36 flex justify-center">
            <div style={{ width: "800px" }} className="alert alert-error">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <span>Error! {errorMessage ?? ERROR_ALERT_MESSAGE}</span>
            </div>
        </div>
    );
};

export default ErrorAlert;
