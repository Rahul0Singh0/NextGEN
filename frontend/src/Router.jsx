import { Route, Routes, Navigate } from "react-router-dom";
import Chat from "./components/Chat";
import Login from "./components/Login";
import Register from "./components/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const RouterContent = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/nextgen" element={
                <ProtectedRoute>
                    <Chat />
                </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
}