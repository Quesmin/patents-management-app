export const areAddressesEqual = (
    address1: string | undefined,
    address2: string | undefined
) => {
    return address1?.toLowerCase() === address2?.toLowerCase();
};
