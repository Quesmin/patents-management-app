import React, { PropsWithChildren } from "react";

export type ModalProps = PropsWithChildren<{
    isShown: boolean;
    onClose: () => void;
}>;

const Modal: React.FC<ModalProps> = ({ isShown, onClose, children }) => {
    if (!isShown) return <></>;

    return (
        <dialog className="modal modal-open">
            <form method="dialog" className="modal-box">
                <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={onClose}
                >
                    ✕
                </button>
                {children}
            </form>
            <form
                method="dialog"
                className="modal-backdrop"
                onClick={onClose}
            />
        </dialog>
    );
};

export default Modal;
