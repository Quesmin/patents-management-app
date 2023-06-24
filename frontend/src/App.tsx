import { Route, Routes } from "react-router-dom";
import "./App.css";
import ErrorAlert from "./common/ErrorAlert/ErrorAlert";
import InfoModal from "./common/InfoModal/InfoModal";
import LoadingScreen from "./common/LoadingScreen/LoadingScreen";
import Admin from "./features/Admin/Admin";
import Landing from "./features/Landing/Landing";
import NotFound from "./features/NotFound/NotFound";
import Patent from "./features/Patent/Patent";
import User from "./features/User/User";
import useEthereumListener from "./hooks/useEthereumListener";
import useInitMetamaskConnection from "./hooks/useInitMetamaskConnection";
import AdminRoute from "./navigation/AdminRoute";
import AuthRoute from "./navigation/AuthRoute";
import { useAppSelector } from "./state/store";

function App() {
    useEthereumListener();
    useInitMetamaskConnection();

    const notificationState = useAppSelector((state) => state.notification);

    return (
        <>
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
            {notificationState.errorAlertMessage.length > 0 && <ErrorAlert />}
            {notificationState.infoModalMessage.length > 0 && <InfoModal />}
            {notificationState.isLoading && <LoadingScreen />}
        </>
    );
}

export default App;
