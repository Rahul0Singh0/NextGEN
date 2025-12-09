import axios from "../config/axiosConfig"; 

export const aiResponse = async ({ prompt }) => {
    try {
        const response = await axios.post('/generate', { prompt });
        return response.data;
    } catch (error) {
        console.error('Error fetching message:', error);
        throw error; 
    }
}

// Note: We are now passing a function to handle the stream chunks
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;
export const streamAiResponse = async ({ prompt }, onChunkReceived, onError) => {
    try {
        const response = await fetch(`${BACKEND_BASE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok || !response.body) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 1. Get the reader from the response stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        // 2. Loop to read chunks as they arrive
        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;

            if (value) {
                const chunk = decoder.decode(value, { stream: true });
                // 3. Pass the chunk of text back to the component immediately
                onChunkReceived(chunk);
            }
        }
    } catch (error) {
        console.error('Error fetching stream:', error);
        onError(error.message); // Pass error message back to component
    }
}