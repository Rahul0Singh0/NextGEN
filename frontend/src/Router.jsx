import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dummy from "./components/Dummy";

export const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/message" element={<Dummy />} />      
            </Routes>
        </BrowserRouter>
    );
}