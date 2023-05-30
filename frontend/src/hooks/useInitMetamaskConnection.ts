import { useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { disconnect } from "wagmi/actions";
import { InjectedConnector } from "wagmi/connectors/injected";
import { logout } from "../state/account/slice";
import { useAppDispatch, useAppSelector } from "../state/store";
import { setPatents } from "../state/patents/slice";

function useInitMetamaskConnection() {
    const accountState = useAppSelector((state) => state.account);
    const dispatch = useAppDispatch();

    const { isConnected } = useAccount();

    const { connect, isError } = useConnect();

    useEffect(() => {
        if (isError) {
            console.log("error connecting to metamask");
            dispatch(setPatents([]));
            dispatch(logout(undefined));
            return;
        }

        if (!isConnected && accountState.isMetamaskConnected) {
            connect({
                connector: new InjectedConnector(),
            });
            return;
        }

        if (isConnected && !accountState.isMetamaskConnected) {
            disconnect();
        }
    }, [
        isConnected,
        isError,
        dispatch,
        connect,
        accountState.isMetamaskConnected,
    ]);
}

export default useInitMetamaskConnection;
