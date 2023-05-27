import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Admin from "./features/Admin/Admin";
import Landing from "./features/Landing/Landing";
import NotFound from "./features/NotFound/NotFound";
import User from "./features/User/User";
import AuthRoute from "./navigation/AuthRoute";
import AdminRoute from "./navigation/AdminRoute";

function App() {
    const [count, setCount] = useState(0);

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
                path="/user"
                element={
                    <AuthRoute>
                        <User />
                    </AuthRoute>
                }
            />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
