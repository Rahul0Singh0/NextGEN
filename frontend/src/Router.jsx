import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Dummy from "./components/Dummy";
import Generator from "./components/Generator";
import Chat from "./components/Chat";

export const Router = () => {
    return (
        <BrowserRouter>
            <nav>
                <Link to="/"><button>Home</button></Link>
                <Link to="/message"><button>Message</button></Link>
                <Link to="/nextgen"><button>NextGen</button></Link>
            </nav>
            <Routes>
                <Route path="/message" element={<Dummy />} />  
                <Route path="/nextgen" element={<Chat />} />      
            </Routes>
        </BrowserRouter>
    );
}