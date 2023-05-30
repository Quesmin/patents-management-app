import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { createPublicClient, http } from "viem";
import { Provider } from "react-redux";
import { persistor, store } from "./state/store.ts";
import { hardhat, localhost } from "wagmi/chains";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from "wagmi/connectors/injected";
import { PersistGate } from "redux-persist/integration/react";

BigInt.prototype.toJSON = function (): string {
    return this.toString();
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [hardhat],
    [publicProvider()]
);

// const config = createConfig({
//     autoConnect: true,
//     connectors: [new MetaMaskConnector()],
//     publicClient: createPublicClient({
//       id
//         chain: localhost,
//         transport: http(),
//     }),
// });

const config = createConfig({
    autoConnect: true,
    publicClient,
    webSocketPublicClient,
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <PersistGate loading={<h1>Loading ...</h1>} persistor={persistor}>
            <Provider store={store}>
                <WagmiConfig config={config}>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </WagmiConfig>
            </Provider>
        </PersistGate>
    </React.StrictMode>
);
