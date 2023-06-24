import { setInfoModalMessage } from "../../state/notification/slice";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { INFO_MODAL_MESSAGE } from "../../utils/constants";
import Modal from "../Modal/Modal";

const InfoModal = () => {
    const dispatch = useAppDispatch();
    const message = useAppSelector(
        (state) => state.notification.infoModalMessage
    );

    return (
        <Modal
            isShown
            onClose={() => {
                dispatch(setInfoModalMessage(""));
            }}
        >
            <div className="flex flex-col items-center p-4">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-info shrink-0 w-24 h-24 mb-8"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                </svg>
                <div className="font-bold text-lg text-gray-300 whitespace-pre-wrap">
                    {message ?? INFO_MODAL_MESSAGE}
                </div>
            </div>

            <button
                onClick={() => dispatch(setInfoModalMessage(""))}
                className="btn btn-active btn-secondary w-full max-w-lg mt-8 capitalize"
            >
                OK
            </button>
        </Modal>
    );
};

export default InfoModal;
