import moment from "moment";
import { State } from "../types/Common";
import {
    BlockchainPatent,
    LicensedContractWithPatentData,
    LicensedPatent,
    PersonalPatentsWithRoyaltyContracts,
} from "../types/Patent";
import { areAddressesEqual } from "./blockchainUtils";

export const getLicensedPatentsAndContractsForCurrentUser = (
    patentsData: BlockchainPatent[],
    licensedData: LicensedPatent[],
    currentUser: string | undefined
) => {
    if (!patentsData.length || !licensedData.length || !currentUser) return [];
    const licensedContracts = licensedData
        .flatMap((licensedPatent) => licensedPatent.royaltyContractsData)
        .filter((royaltyContract) =>
            areAddressesEqual(royaltyContract.licensee, currentUser)
        );

    const result: LicensedContractWithPatentData[] = [];
    licensedContracts.forEach((licensedContract) => {
        const patent = patentsData.find(
            (patent) => patent.id === licensedContract.patentId
        );

        if (!patent) return;

        result.push({
            ...licensedContract,
            patent,
        });
    });

    return result;
};

export const getPersonalGrantedPatentsWithRoyaltyContracts = (
    patentsData: BlockchainPatent[],
    licensedData: LicensedPatent[],
    currentUser: string | undefined
): PersonalPatentsWithRoyaltyContracts[] => {
    if (!patentsData.length || !currentUser) return [];

    const result: PersonalPatentsWithRoyaltyContracts[] = [];
    patentsData
        .filter(
            (p) =>
                areAddressesEqual(p.owner, currentUser) &&
                p.status === State.Granted
        )
        .forEach((patent) => {
            const patentContracts = licensedData.find(
                (data) => data.patentId === patent.id
            )?.royaltyContractsData;

            result.push({
                patent: patent,
                royaltyContracts: patentContracts ?? [],
            });
        });

    return result;
};

export const convertUnixToDateFormat = (unix: number) => {
    return moment.unix(unix).format("MMM Do YYYY HH:mm");
};

export const getIsContracValid = (
    royaltyContract: LicensedContractWithPatentData | undefined
) => {
    if (!royaltyContract) return false;

    const now = moment().unix();

    return (
        now < +royaltyContract.expirationDate.toString() ||
        now < +royaltyContract.paidUntil.toString()
    );
};

export const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noreferrer");
};
