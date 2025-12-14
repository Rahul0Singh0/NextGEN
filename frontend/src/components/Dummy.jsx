import { useState } from "react";
import { pingMessage } from "../apis/ping.js";

export default function Dummy() {
    const [message, setMessage] = useState(""); 

    const getMessage = async () => {
        try {
            const response = await pingMessage();
            console.log('Response from backend:', response);
            setMessage(response.message);
        } catch (error) {
            console.error('Error fetching message:', error);
        }   
    }

    return (
        <>
            <div>
                <button onClick={getMessage}>Get Message from Backend</button>
                {message && <p>Message: {message}</p>}
            </div>
        </>
    );
}