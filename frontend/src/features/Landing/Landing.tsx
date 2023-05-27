import { Navigate } from "react-router-dom";
import { useAccount, useConnect, useContractRead } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MANAGMENT_CONTRACT_ADDRESS } from "../../utils/constants";
import PatentManagement from "./../../abis/PatentManagement.json";

const Landing = () => {
    const { address, isConnected } = useAccount();
    const { data: adminAddress, isLoading: isLoadingAdminAddress } =
        useContractRead({
            address: MANAGMENT_CONTRACT_ADDRESS,
            abi: PatentManagement.abi,
            functionName: "admin",
        });

    const { connect } = useConnect({
        connector: new InjectedConnector(),
    });

    if (isLoadingAdminAddress) {
        return <h1>Loading...</h1>;
    }

    return (
        <>
            <div>Landing</div>
            {isConnected ? (
                address === adminAddress ? (
                    <Navigate to="/admin" />
                ) : (
                    <Navigate to="/user" />
                )
            ) : (
                <button onClick={() => connect()}>Connect Wallet</button>
            )}
        </>
    );
};

export default Landing;
