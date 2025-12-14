import axios from "axios";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL_V2;
const API_BASE = `${BACKEND_BASE_URL}/chat`; 
console.log("Chat API Base URL:", API_BASE);

export const streamChatContent = async ({ prompt, sessionId }, onChunkReceived, onError) => {
    try {
        const fullUrl = `${API_BASE}/stream`;
        
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

export const fetchChatHistory = async (sessionId) => {
    try {
        const response = await axios.get(`${API_BASE}/history/${sessionId}`);
        return response.data.messages || []; 
    } catch (error) {
        console.error(`Error fetching history for ${sessionId}:`, error);
        return [];
    }
};

export const fetchChatSessions = async () => {
    try {
        const response = await axios.get(`${API_BASE}/sessions`);
        return response.data; 
    } catch (error) {
        console.error('Error fetching chat list:', error);
        return []; 
    }
};

export const renameChatSession = async (sessionId, newTitle) => {
    try {
        await axios.put(`${API_BASE}/rename/${sessionId}`, { title: newTitle });
        return true;
    } catch (error) {
        console.error(`Error renaming session ${sessionId}:`, error);
        throw new Error('Failed to rename chat session.');
    }
};

export const deleteChatSession = async (sessionId) => {
    try {
        await axios.delete(`${API_BASE}/${sessionId}`);
        return true;
    } catch (error) {
        console.error(`Error deleting session ${sessionId}:`, error);
        throw new Error('Failed to delete chat session.');
    }
};