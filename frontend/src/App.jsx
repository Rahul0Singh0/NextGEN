import { BrowserRouter } from "react-router-dom"; 
import { RouterContent } from "./Router"; 

function App() {
  return (
    <BrowserRouter>
        <div className="d-flex flex-column vh-100 bg-white">
            <RouterContent />
        </div>
    </BrowserRouter>
  );
}

export default App;