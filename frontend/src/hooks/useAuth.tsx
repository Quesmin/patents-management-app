import React from "react";
import { MetamaskContext } from "../context/MetamaskContext";
import { useAccount, useContractRead } from "wagmi";
import { MANAGMENT_CONTRACT_ADDRESS } from "../utils/constants";
import PatentManagement from "abis/PatentManagement.json";

const useAuth = () => {
    // const context = React.useContext(MetamaskContext);

    const { address, isConnected } = useAccount();

    // const {
    //     data: adminAddress,
    //     isError,
    //     isLoading,
    // } = useContractRead({
    //     address: MANAGMENT_CONTRACT_ADDRESS,
    //     abi: PatentManagement.abi,
    //     functionName: "admin",
    // });

    // if (context === "undefined") {
    //     throw new Error(
    //         "useMetamask hook should be used with MetamaskProvider component"
    //     );
    // }

    return context;
};

export default useAuth;
