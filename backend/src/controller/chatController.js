import { GoogleGenAI } from "@google/genai";
import Chat from '../models/Chat.js';

const ai = new GoogleGenAI({}); 

/**
 * Converts Mongoose messages into the format required by the Gemini Chat service.
 * @param {Array<Object>} messages 
 * @returns {Array<Object>} Gemini history format
 */
const formatHistoryForGemini = (messages) => {
    return messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));
};

/**
 * Handles the streaming chat request, managing history persistence.
 */
export const streamChatContent = async (req, res) => {
    // 1. Basic Validation
    const { prompt, sessionId } = req.body; 

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).send("API Key not configured.");
    }
    if (!prompt || !sessionId) {
        return res.status(400).send("Prompt and Session ID are required.");
    }

    try {
        // 2. Load History and Setup
        let chatDocument = await Chat.findOne({ sessionId });
        if (!chatDocument) {
            // Create a new chat session if none exists
            chatDocument = await Chat.create({ sessionId, messages: [] });
        }
        
        // Add the user's message to the database object immediately
        chatDocument.messages.push({ role: 'user', content: prompt });
        await chatDocument.save();

        // 3. Initialize Gemini Chat Session with History
        // Exclude the user's latest prompt from the history array passed to 'history'
        // because the user's latest prompt is passed separately in sendMessageStream.
        const historyForGemini = formatHistoryForGemini(
            chatDocument.messages.slice(0, -1) // All messages EXCEPT the last user prompt
        );

        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            history: historyForGemini
        });

        // 4. Stream the Response
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');
        
        // Use the chat session to send the message stream
        const responseStream = await chat.sendMessageStream({ message: prompt });
        let modelResponse = ''; 

        for await (const chunk of responseStream) {
            res.write(chunk.text);
            modelResponse += chunk.text;
        }

        res.end(); // Close the connection

        // 5. Save the model's full response
        if (modelResponse) {
            chatDocument.messages.push({ role: 'model', content: modelResponse });
            await chatDocument.save();
        }

    } catch (error) {
        console.error("Chat Streaming Error:", error);
        if (!res.headersSent) {
            res.status(500).send("Server error during chat streaming.");
        } else {
            res.end();
        }
    }
};

/**
 * Deletes a chat session by its ID.
 */
export const deleteChatSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const result = await Chat.deleteOne({ sessionId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Chat session not found." });
        }

        res.status(200).json({ message: "Chat session deleted successfully." });
    } catch (error) {
        console.error("Error deleting chat:", error);
        res.status(500).json({ error: "Server error during chat deletion." });
    }
};

/**
 * Fetches the existing message history for a session ID.
 */
export const getChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const chatDocument = await Chat.findOne({ sessionId });

        if (!chatDocument) {
            // Return an empty array for a brand new session
            return res.status(200).json({ messages: [] });
        }

        res.status(200).json({ messages: chatDocument.messages });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ error: "Server error during history fetch." });
    }
};

// backend/controllers/chatController.js (Add this function)

/**
 * Fetches a list of all chat sessions for the sidebar preview.
 * For simplicity, this currently returns a list of *all* sessions in the DB.
 * In a real application, you would filter by user ID.
 */
export const getChatSessions = async (req, res) => {
    try {
        // Find all chat documents
        const sessions = await Chat.find({})
            // 1. FIX: Include 'updatedAt' in the selected fields
            .select('sessionId messages createdAt updatedAt') 
            // 2. Sort by most recently updated (descending)
            .sort({ updatedAt: -1 })
            // Limit the result size for performance
            .limit(50); 

        // Map the results to a clean format for the frontend
        const previewList = sessions.map(session => {
            // Get the first user message to use as the title/preview
            const firstMessage = session.messages.find(msg => msg.role === 'user');
            
            return {
                sessionId: session.sessionId,
                // Use the first user message or a default title
                title: firstMessage 
                    ? firstMessage.content.substring(0, 30) + (firstMessage.content.length > 30 ? '...' : '') 
                    : 'New Chat',
                createdAt: session.createdAt,
                // Optional: Include updatedAt in the returned data as well
                updatedAt: session.updatedAt, 
            };
        });

        res.status(200).json(previewList);
    } catch (error) {
        console.error("Error fetching chat sessions:", error);
        res.status(500).json({ error: "Server error fetching chat list." });
    }
};