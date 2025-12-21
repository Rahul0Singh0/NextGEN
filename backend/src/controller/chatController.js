import { GoogleGenAI } from "@google/genai";
import Chat from '../models/Chat.js';

const ai = new GoogleGenAI({}); 

const formatHistoryForGemini = (messages) => {
    return messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));
};


export const streamChatContent = async (req, res) => {
    const { prompt, sessionId } = req.body; 

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).send("API Key not configured.");
    }
    if (!prompt || !sessionId) {
        return res.status(400).send("Prompt and Session ID are required.");
    }

    try {
        let chatDocument = await Chat.findOne({ sessionId });
        if (!chatDocument) {
            chatDocument = await Chat.create({ sessionId, messages: [] });
        }
        
        chatDocument.messages.push({ role: 'user', content: prompt });
        await chatDocument.save();

        const historyForGemini = formatHistoryForGemini(
            chatDocument.messages.slice(0, -1)
        );

        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            history: historyForGemini
        });

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');
        
        const responseStream = await chat.sendMessageStream({ message: prompt });
        let modelResponse = ''; 

        for await (const chunk of responseStream) {
            res.write(chunk.text);
            modelResponse += chunk.text;
        }

        res.end();

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


export const getChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const chatDocument = await Chat.findOne({ sessionId });

        if (!chatDocument) {
            return res.status(200).json({ messages: [] });
        }

        res.status(200).json({ messages: chatDocument.messages });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ error: "Server error during history fetch." });
    }
};

export const getChatSessions = async (req, res) => {
    try {
        const sessions = await Chat.find({ user: req.user._id }) 
            .select('sessionId messages title createdAt updatedAt')
            .sort({ updatedAt: -1 });

        const previewList = sessions.map(session => {
            const firstMessage = session.messages.find(msg => msg.role === 'user');
            
            return {
                sessionId: session.sessionId,
                title: session.title 
                    ? session.title
                    : firstMessage 
                        ? firstMessage.content.substring(0, 30) + '...' 
                        : 'New Chat',
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
            };
        });

        res.status(200).json(previewList);
    } catch (error) {
        console.error("Error fetching chat sessions:", error);
        res.status(500).json({ error: "Server error fetching chat list." });
    }
};

export const renameChatController = async (req, res) => {
    const { sessionId } = req.params;
    const { title } = req.body;

    try {
        await Chat.updateOne({ sessionId }, { $set: { title: title } }); 
        res.status(200).json({ message: 'Chat renamed successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update chat title.' });
    }
};