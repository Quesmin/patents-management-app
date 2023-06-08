import React, { useState } from "react";
import Modal, { ModalProps } from "../../../common/Modal/Modal";

type SubmitDraftModalProps = ModalProps & {
    onSubmitDraft: (title: string, patentFile: File | null) => Promise<void>;
};

const SubmitDraftModal: React.FC<SubmitDraftModalProps> = ({
    isShown,
    onClose,
    onSubmitDraft,
}) => {
    const [patentTitle, setPatentTitle] = useState("");
    const [patentFile, setPatentFile] = React.useState<File | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleSubmitPatent = async () => {
        await onSubmitDraft(patentTitle, patentFile);
        setPatentTitle("");
        setPatentFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onClose();
    };

    return (
        <Modal isShown={isShown} onClose={onClose}>
            <div className="flex flex-col py-8 items-center gap-4">
                <h3 className="font-bold text-lg mb-4">Submit Draft Patent</h3>

                <div className="form-control w-full max-w-lg">
                    <label className="label">
                        <span className="label-text">Patent Title</span>
                    </label>
                    <input
                        value={patentTitle}
                        onChange={(e) => setPatentTitle(e.target.value)}
                        type="text"
                        className="input input-bordered w-full max-w-lg"
                    />
                </div>
                <div className="form-control w-full max-w-lg">
                    <label className="label">
                        <span className="label-text">Patent PDF</span>
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="file-input file-input-bordered file-input-info w-full max-w-lg"
                        accept="application/pdf"
                        required
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setPatentFile(file);
                            }
                        }}
                    />
                </div>

                <button
                    onClick={async () => await handleSubmitPatent()}
                    className="btn btn-active btn-accent w-full max-w-lg mt-8 capitalize"
                >
                    Submit
                </button>
            </div>
        </Modal>
    );
};

export default SubmitDraftModal;
