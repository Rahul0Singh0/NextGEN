import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Dummy from "./components/Dummy";
import Generator from "./components/Generator";

export const Router = () => {
    return (
        <BrowserRouter>
            <nav>
                <Link to="/message"><button>Message</button></Link>
                <Link to="/nextgen"><button>NextGen</button></Link>
            </nav>
            <Routes>
                <Route path="/message" element={<Dummy />} />  
                <Route path="/nextgen" element={<Generator />} />      
            </Routes>
        </BrowserRouter>
    );
}