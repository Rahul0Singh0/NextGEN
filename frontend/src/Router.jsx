import { Route, Routes } from "react-router-dom";
import Chat from "./components/Chat";

export const RouterContent = () => {
    return (
        <Routes>
            <Route path="/" element={
                <Chat />
            } />
            <Route path="/nextgen" element={<Chat />} /> 
        </Routes>
    );
}