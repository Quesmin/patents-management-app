import React from "react";
import { useContractRead } from "wagmi";
import config from "../../config";
import PatentManagement from "../abis/PatentManagement.json";
import { setLicensedPatents } from "../state/licensed/slice";
import { useAppDispatch } from "../state/store";
import { LicensedPatent } from "../types/Patent";

const useLicensedPatents = () => {
    const dispatch = useAppDispatch();
    const isMounted = React.useRef(true);

    const { data } = useContractRead({
        address: config.PATENT_MANAGEMENT_CONTRACT_ADDRESS,
        abi: PatentManagement.abi,
        functionName: "getContractsForAllPatents",
    });

    React.useEffect(() => {
        if (isMounted.current) {
            if (data) {
                dispatch(setLicensedPatents(data as LicensedPatent[]));
            } else {
                dispatch(setLicensedPatents([]));
            }
        }

        return () => {
            isMounted.current = false;
        };
    }, [data, dispatch]);

    return (data ?? []) as LicensedPatent[];
};

export default useLicensedPatents;
