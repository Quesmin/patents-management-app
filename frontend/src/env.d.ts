/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PINATA_API_KEY: string;
    readonly VITE_PINATA_API_SECRET: string;
    readonly VITE_PATENT_MANAGEMENT_CONTRACT_ADDRESS: string;
    readonly VITE_IPFS_GATEWAY: string;
    readonly VITE_IPFS_SUBMIT_LINK: string;
    readonly VITE_IPFS_DELETE_LINK: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
