import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Admin from "./features/Admin/Admin";
import Landing from "./features/Landing/Landing";
import NotFound from "./features/NotFound/NotFound";
import User from "./features/User/User";
import AuthRoute from "./navigation/AuthRoute";
import AdminRoute from "./navigation/AdminRoute";
import useEthereumListener from "./hooks/useEthereumListener";
import Patent from "./features/Patent/Patent";
import useInitMetamaskConnection from "./hooks/useInitMetamaskConnection";

function App() {
    useEthereumListener();
    useInitMetamaskConnection();

    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <Admin />
                    </AdminRoute>
                }
            />

            <Route
                path="/admin/:id"
                element={
                    <AdminRoute>
                        <Patent />
                    </AdminRoute>
                }
            />
            <Route
                path="/user/:id"
                element={
                    <AuthRoute>
                        <Patent />
                    </AuthRoute>
                }
            />
            <Route
                path="/user"
                element={
                    <AuthRoute>
                        <User />
                    </AuthRoute>
                }
            />
            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
