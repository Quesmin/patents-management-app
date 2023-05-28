import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
    interface Window {
        ethereum?: any;
    }
    interface BigInt {
        toJSON(): string;
    }
}
