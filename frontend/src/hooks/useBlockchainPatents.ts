import { useContractRead } from "wagmi";
import { MANAGEMENT_CONTRACT_ADDRESS } from "../utils/constants";
import PatentManagement from "../abis/PatentManagement.json";
import { setPatents } from "../state/patents/slice";
import { BlockchainPatent } from "../types/Patent";
import { useAppDispatch } from "../state/store";
import React from "react";

const useBlockchainPatents = () => {
    const dispatch = useAppDispatch();
    const isMounted = React.useRef(true);

    const { data } = useContractRead({
        address: MANAGEMENT_CONTRACT_ADDRESS,
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

export default useBlockchainPatents;
