import React, { useState, useEffect, useRef } from 'react';
import ChatList from './ChatList'; 
import { streamChatContent, fetchChatHistory, fetchChatSessions, deleteChatSession } from '../apis/chatApi'; 

// Helper function to create a simple unique ID
const generateSessionId = () => {
    return 'chat-' + Date.now() + Math.random().toString(36).substring(2, 9);
};

// --- CHAT COMPONENT ---
function Chat() {
    
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [sessionId, setSessionId] = useState(null); 
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [chatList, setChatList] = useState([]); 
    
    const messagesEndRef = useRef(null); 

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // --- Core Data Fetching Functions ---

    const loadChatList = async () => {
        const list = await fetchChatSessions();
        setChatList(list);
    };

    const loadChatHistory = async (id) => {
        const history = await fetchChatHistory(id);
        setMessages(history);
        scrollToBottom();
    };

    // --- Effect Hooks ---

    // Initial setup: Only load the list of sessions. 
    useEffect(() => {
        loadChatList(); 
    }, []);

    // Load history ONLY when sessionId state changes (user clicks)
    useEffect(() => {
        if (sessionId) {
            loadChatHistory(sessionId);
        }
    }, [sessionId]);

    // Scroll to bottom whenever messages are updated
    useEffect(scrollToBottom, [messages]);

    // --- Action Handlers ---

    const handleSelectChat = (newId) => {
        setError(null);

        if (newId === 'new') {
            const newSessionId = generateSessionId(); 
            localStorage.setItem('chatSessionId', newSessionId);
            setMessages([]); 
            setSessionId(newSessionId); 
            setCurrentPrompt('');
        } else if (newId !== sessionId) {
            localStorage.setItem('chatSessionId', newId);
            setSessionId(newId); 
        }
    };

    const handleDeleteChat = async (idToDelete) => {
        if (!window.confirm("Are you sure you want to delete this chat history?")) return;

        try {
            await deleteChatSession(idToDelete); 

            if (idToDelete === sessionId) {
                setSessionId(null); 
                setMessages([]);    
                localStorage.removeItem('chatSessionId');
            }
            
            loadChatList(); 
        } catch (error) {
            setError(error.message || "Failed to delete chat.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const userPrompt = currentPrompt.trim();
        if (!userPrompt || isLoading || !sessionId) return; 
        
        setError(null);
        setIsLoading(true);
        setCurrentPrompt(''); 

        const newUserMessage = { role: 'user', content: userPrompt };
        setMessages(prev => [...prev, newUserMessage, { role: 'model', content: '', isStreaming: true }]);

        let fullModelResponse = '';
        
        const handleChunk = (chunk) => {
            fullModelResponse += chunk;
            setMessages(prev => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                newMessages[lastIndex].content = fullModelResponse;
                return newMessages;
            });
        };

        try {
            await streamChatContent(
                { prompt: userPrompt, sessionId }, 
                handleChunk, 
                (errorMessage) => setError(errorMessage)
            );
        } catch (error) {
            console.error('API Error:', error);
            setError("Network error or failed to start chat stream.");
        } finally {
            setMessages(prev => {
                const finalMessages = [...prev];
                finalMessages[finalMessages.length - 1].isStreaming = false;
                return finalMessages;
            });
            setIsLoading(false);
            loadChatList(); 
        }
    };
    
    // --- Render ---
    return (
        // Main Container: d-flex, 100vh height, max width, margin auto, border/rounded
        <div className="d-flex vh-100 mx-auto border border-secondary rounded-3" style={{ maxWidth: '1200px' }}>
            
            {/* 1. Chat List Sidebar */}
            <ChatList 
                sessions={chatList} 
                currentSessionId={sessionId} 
                onSelectChat={handleSelectChat} 
                onDeleteChat={handleDeleteChat}
            /> 
            
            {/* 2. Main Chat Interface (flex-grow-1 takes remaining space) */}
            <div className="chat-interface d-flex flex-column flex-grow-1 bg-light">
                
                {sessionId ? (
                    <>
                        {/* Header: padding, border bottom */}
                        <h2 className="p-3 border-bottom fs-5 text-dark">
                            {chatList.find(c => c.sessionId === sessionId)?.title || "AI Chat"}
                        </h2>
                        
                        {/* Message Display Area: flex-grow-1, overflow scroll, padding */}
                        <div className="messages-area flex-grow-1 overflow-auto p-3">
                            {messages.map((message, index) => (
                                <div 
                                    key={index} 
                                    // Chat bubble alignment and spacing
                                    className={`d-flex ${message.role === 'user' ? 'justify-content-end' : 'justify-content-start'} mb-3`}
                                >
                                    <div 
                                        // Chat bubble styling
                                        className={`p-3 rounded-4 ${
                                            message.role === 'user' 
                                            ? 'bg-success-subtle text-dark border border-success-subtle' 
                                            : 'bg-white text-dark border border-light-subtle'
                                        }`}
                                        style={{ maxWidth: '70%' }}
                                    >
                                        <strong className="text-capitalize">{message.role}:</strong>
                                        <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                            {message.content}
                                        </p>
                                        {message.isStreaming && <span className="cursor-blink">|</span>}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Form: padding, border top, d-flex, background white */}
                        <form onSubmit={handleSubmit} className="p-3 border-top d-flex bg-white">
                            <input
                                type="text"
                                value={currentPrompt}
                                onChange={(e) => setCurrentPrompt(e.target.value)}
                                placeholder={isLoading ? 'Waiting for response...' : 'Type your message...'}
                                disabled={isLoading || !sessionId}
                                // flex-grow-1, padding, rounded, border, margin right
                                className="form-control flex-grow-1 me-2"
                            />
                            <button 
                                type="submit" 
                                disabled={isLoading || !sessionId} 
                                // Primary button styling
                                className="btn btn-primary"
                            >
                                {isLoading ? 'Sending...' : 'Send'}
                            </button>
                        </form>
                    </>
                ) : (
                    // Default view when no chat is selected (d-grid, place-items-center)
                    <div className="d-flex flex-column flex-grow-1 justify-content-center align-items-center text-secondary">
                        <h2 className="fs-4 text-center">👋 Select a Conversation or Start a New Chat</h2>
                    </div>
                )}
                
                {/* Error Display */}
                {error && <p className="text-danger text-center p-2 small">{error}</p>}
            </div>
        </div>
    );
}

export default Chat;