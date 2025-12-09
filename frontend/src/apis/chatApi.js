import axios from "axios";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL_V2;
const API_BASE = `${BACKEND_BASE_URL}/chat`; 
console.log("Chat API Base URL:", API_BASE);

/**
 * Streams the new message and receives response chunks (POST).
 * Uses native fetch for streaming efficiency.
 */
export const streamChatContent = async ({ prompt, sessionId }, onChunkReceived, onError) => {
    try {
        const fullUrl = `${API_BASE}/stream`; // POST /api/v2/chat/stream
        
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, sessionId }), 
        });

        if (!response.ok || !response.body) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}. Details: ${errorBody.substring(0, 100)}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
                const chunk = decoder.decode(value, { stream: true });
                onChunkReceived(chunk);
            }
        }
    } catch (error) {
        console.error('Error fetching stream:', error);
        onError(error.message); 
    }
};

/**
 * Fetches the full message history for a given session ID (GET).
 * Uses Axios.
 */
export const fetchChatHistory = async (sessionId) => {
    try {
        // GET /api/v2/chat/history/:sessionId
        const response = await axios.get(`${API_BASE}/history/${sessionId}`);
        // The backend returns an object with a 'messages' array
        return response.data.messages || []; 
    } catch (error) {
        console.error(`Error fetching history for ${sessionId}:`, error);
        return [];
    }
};

/**
 * Fetches the list of all chat sessions for the sidebar preview (GET).
 * Uses Axios.
 */
export const fetchChatSessions = async () => {
    try {
        // GET /api/v2/chat/sessions
        const response = await axios.get(`${API_BASE}/sessions`);
        // Backend returns array of {sessionId, title, createdAt, etc.}
        return response.data; 
    } catch (error) {
        console.error('Error fetching chat list:', error);
        return []; 
    }
};

/**
 * Deletes a chat session by its ID (DELETE).
 * Uses Axios.
 */
export const deleteChatSession = async (sessionId) => {
    try {
        // DELETE /api/v2/chat/:sessionId
        await axios.delete(`${API_BASE}/${sessionId}`);
        return true;
    } catch (error) {
        console.error(`Error deleting session ${sessionId}:`, error);
        throw new Error('Failed to delete chat session.');
    }
};