const config = {
    PINATA_API_KEY: import.meta.env.VITE_PINATA_API_KEY,
    PINATA_API_SECRET: import.meta.env.VITE_PINATA_API_SECRET,
    PATENT_MANAGEMENT_CONTRACT_ADDRESS: import.meta.env
        .VITE_PATENT_MANAGEMENT_CONTRACT_ADDRESS as `0x${string}`,
    IPFS_GATEWAY: import.meta.env.VITE_IPFS_GATEWAY,
    IPFS_SUBMIT_LINK: import.meta.env.VITE_IPFS_SUBMIT_LINK,
    IPFS_DELETE_LINK: import.meta.env.VITE_IPFS_DELETE_LINK,
};

export default config;
