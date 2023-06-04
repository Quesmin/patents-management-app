import React from "react";
import { Navigate } from "react-router-dom";
import { useAccount, useContractRead } from "wagmi";
import { login, setCurrentAccount } from "../../state/account/slice";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { CurrentAccount } from "../../types/Account";
import config from "./../../../config";
import PatentManagement from "./../../abis/PatentManagement.json";
import metamaskIcon from "./../../assets/MetaMaskFox.svg";

const Landing = () => {
    const dispatch = useAppDispatch();
    const accountState = useAppSelector((store) => store.account);
    const { address, isConnected } = useAccount();
    const { data: adminAddress, isLoading: isLoadingAdminAddress } =
        useContractRead({
            address: config.PATENT_MANAGEMENT_CONTRACT_ADDRESS,
            abi: PatentManagement.abi,
            functionName: "admin",
        });

    React.useEffect(() => {
        if (isConnected && address && accountState.isMetamaskConnected) {
            const newCurrentAccount: CurrentAccount = {
                address: address,
                isAdmin: adminAddress === address,
            };

            dispatch(setCurrentAccount(newCurrentAccount));
        }
    }, [
        accountState.isMetamaskConnected,
        address,
        adminAddress,
        dispatch,
        isConnected,
    ]);

    if (isLoadingAdminAddress) {
        return <h1>Loading...</h1>;
    }

    return (
        <div className="flex w-full pt-20 gap-56">
            <div className="flex flex-col flex-1 text-start gap-14">
                <div className="flex flex-col mb-3 font-bold text-8xl">
                    The place where we reward
                    <span className="inline-block font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                        innovations
                    </span>
                </div>
                <div className=" opacity-70 text-2xl text-start">
                    Help the world with your inventions and get rewarded by
                    doing so. We provide an environment full of trustiness and
                    transparency using blockchain technology.
                </div>

                <div>
                    {accountState.currentAccount ? (
                        accountState.currentAccount.isAdmin ? (
                            <Navigate to="/admin" />
                        ) : (
                            <Navigate to="/user" />
                        )
                    ) : (
                        <button
                            className="btn btn-accent normal-case font-extrabold text-xl"
                            onClick={() => {
                                dispatch(login(undefined));
                            }}
                        >
                            Connect with
                            <img
                                style={{ width: 48, height: 48 }}
                                className="w-20 h-20"
                                src={metamaskIcon}
                                alt="metamaskIcon"
                            />
                        </button>
                    )}
                </div>
            </div>
            <div className="relative flex-1">
                <div
                    style={{
                        height: "600px",
                        width: "400px",
                        display: "inline-block",
                    }}
                    className="absolute top-0 left-0 bg-white rounded-lg bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-30"
                />
                <div
                    style={{
                        height: "600px",
                        width: "400px",
                        display: "inline-block",
                    }}
                    className="absolute top-10 left-10 bg-white rounded-lg bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-30"
                ></div>
                <div
                    style={{
                        height: "600px",
                        width: "400px",
                        display: "inline-block",
                    }}
                    className="absolute flex flex-col gap-8 pt-32 column top-20 left-20 bg-white rounded-lg bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-30"
                >
                    <div
                        style={{
                            height: "48px",
                            width: "48px",
                            display: "inline-block",
                        }}
                        className="absolute top-12 left-8 bg-accent rounded-full bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-40"
                    />

                    <div className="h-4 w-60 m-8 bg-gray-900 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-40" />
                    <div className="h-4 w-40 m-8 bg-gray-900 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-40" />
                    <div className="h-4 w-60 m-8 bg-gray-900 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-40" />
                    <div className="h-4 w-20 m-8 bg-gray-900 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-40" />
                    <div className="h-4 w-40 m-8 bg-gray-900 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-40" />
                    <div className="h-4 w-60 m-8 bg-gray-900 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-40" />
                </div>
            </div>
        </div>
    );
};

export default Landing;
