import { useContractRead } from "wagmi";
import PatentManagement from "../abis/PatentManagement.json";
import { setPatents } from "../state/patents/slice";
import { BlockchainPatent } from "../types/Patent";
import { useAppDispatch } from "../state/store";
import React from "react";
import config from "../../config";

const useBlockchainPatentsSync = () => {
    const dispatch = useAppDispatch();
    const isMounted = React.useRef(true);

    const { data } = useContractRead({
        address: config.PATENT_MANAGEMENT_CONTRACT_ADDRESS,
        abi: PatentManagement.abi,
        functionName: "viewPatents",
    });

    React.useEffect(() => {
        if (isMounted.current) {
            if (data) {
                dispatch(setPatents(data as BlockchainPatent[]));
            } else {
                dispatch(setPatents([]));
            }
        }

        return () => {
            isMounted.current = false;
        };
    }, [data, dispatch]);

    return (data ?? []) as BlockchainPatent[];
};

export default useBlockchainPatentsSync;
