import React, { useState, useEffect, useRef } from 'react';
import ChatList from './ChatList'; 
import { streamChatContent, fetchChatHistory, fetchChatSessions, deleteChatSession } from '../apis/chatApi'; 

const generateSessionId = () => {
    return 'chat-' + Date.now() + Math.random().toString(36).substring(2, 9);
};

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

    const loadChatList = async () => {
        const list = await fetchChatSessions();
        setChatList(list);
    };

    const loadChatHistory = async (id) => {
        const history = await fetchChatHistory(id);
        setMessages(history);
        scrollToBottom();
    };

    useEffect(() => {
        loadChatList(); 
    }, []);

    useEffect(() => {
        if (sessionId) {
            loadChatHistory(sessionId);
        }
    }, [sessionId]);

    useEffect(scrollToBottom, [messages]);

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
    
    return (
        <div className="d-flex w-100 h-100">
            
            <ChatList 
                sessions={chatList} 
                currentSessionId={sessionId} 
                onSelectChat={handleSelectChat} 
                onDeleteChat={handleDeleteChat}
                loadChatList={loadChatList}
            /> 
            
            <div className="chat-interface d-flex flex-column flex-grow-1 bg-white">
                
                {sessionId ? (
                    <>
                        <div className="d-flex justify-content-center border-bottom bg-light shadow-sm py-3 px-2">
                           <h2 className="fs-5 text-dark fw-bold">
                                {chatList.find(c => c.sessionId === sessionId)?.title || "NextGen AI Chat"}
                            </h2>
                        </div>
                        
                        <div className="messages-area flex-grow-1 overflow-auto pt-5 pb-3">
                            {messages.map((message, index) => (
                                <div 
                                    key={index} 
                                    className="d-flex justify-content-center px-4 mb-3" 
                                >
                                    <div 
                                        className={`p-3 rounded-3 shadow-sm ${
                                            message.role === 'user' 
                                            ? 'bg-primary text-white' 
                                            : 'bg-light text-dark border border-secondary-subtle'
                                        }`}
                                        style={{ maxWidth: '800px', width: '100%' }}
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

                        {/* Input Form Wrapper */}
                        <div className="p-3 border-top bg-light d-flex justify-content-center">
                            <form onSubmit={handleSubmit} className="d-flex" style={{ maxWidth: '800px', width: '100%' }}>
                                <input
                                    type="text"
                                    value={currentPrompt}
                                    onChange={(e) => setCurrentPrompt(e.target.value)}
                                    placeholder={isLoading ? 'Waiting for response...' : 'Type your message...'}
                                    disabled={isLoading || !sessionId}
                                    className="form-control flex-grow-1 me-2 rounded-pill shadow-sm"
                                />
                                <button 
                                    type="submit" 
                                    disabled={isLoading || !sessionId} 
                                    className="btn btn-success rounded-pill"
                                >
                                    {isLoading ? 'Sending...' : 'Send'}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="d-flex flex-column flex-grow-1 justify-content-center align-items-center text-secondary">
                        <h2 className="fs-4 text-center text-muted">👋 Select a Conversation or Start a New Chat</h2>
                    </div>
                )}
                
                {error && <p className="text-danger text-center p-2 small">{error}</p>}
            </div>
        </div>
    );
}

export default Chat;