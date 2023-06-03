import React, { useState } from "react";

import { CurrentAccount } from "../../types/Account";
import userIcon from "./../../assets/user-regular.svg";
import { useAppDispatch } from "../../state/store";
import { setPatents } from "../../state/patents/slice";
import { logout } from "../../state/account/slice";

type HeaderProps = {
    currentAccount?: CurrentAccount;
};

const Header: React.FC<HeaderProps> = ({ currentAccount }) => {
    const dispatch = useAppDispatch();

    return (
        <div className="navbar bg-base-100 gap-4">
            <div className="flex-1">
                <div className="normal-case text-2xl font-black">Patex</div>
            </div>

            <div className="text-lg font-bold">{currentAccount?.address}</div>
            <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                    <div className="w-10 rounded-full">
                        <img src={userIcon} />
                    </div>
                </label>

                <ul
                    tabIndex={0}
                    className="shadow menu menu-sm dropdown-content bg-base-200 rounded-box w-52 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70"
                >
                    <li>
                        <a
                            onClick={async () => {
                                dispatch(setPatents([]));
                                dispatch(logout(undefined));
                            }}
                        >
                            Disconnect
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Header;
