import { useState, useEffect, useRef } from 'react';
import ChatList from './ChatList'; 
import { streamChatContent, fetchChatHistory, fetchChatSessions, deleteChatSession } from '../apis/chatApi'; 

const generateSessionId = () => {
    return 'chat-' + Date.now() + Math.random().toString(36).substring(2, 9);
};

function Chat() {
    
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [sessionId, setSessionId] = useState(null); // Start as NULL to prevent auto-load
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
        
        // Optional: Ensure localStorage is clean on initial mount if we want to force a new start
        // localStorage.removeItem('chatSessionId');
        
        // We DO NOT call setSessionId(currentId) here.
    }, []);

    useEffect(() => {
        if (sessionId) {
            loadChatHistory(sessionId);
        }
    }, [sessionId]);

    // Scroll to bottom whenever messages are updated
    useEffect(scrollToBottom, [messages]);


    // Handles selecting an existing chat or starting a new one
    const handleSelectChat = (newId) => {
        setError(null);

        if (newId === 'new') {
            // Start a brand new session
            const newSessionId = generateSessionId(); 
            localStorage.setItem('chatSessionId', newSessionId);
            setMessages([]); // Clear messages immediately
            setSessionId(newSessionId); // Set ID, which triggers history fetch (empty history)
            setCurrentPrompt('');
        } else if (newId !== sessionId) {
            // Switch to an existing chat
            localStorage.setItem('chatSessionId', newId);
            setSessionId(newId); 
            // The history will load via the useEffect [sessionId] dependency
        }
    };

    // Handles deleting a chat session
    const handleDeleteChat = async (idToDelete) => {
        if (!window.confirm("Are you sure you want to delete this chat history?")) return;

        try {
            await deleteChatSession(idToDelete); 

            // If the deleted chat was the current one, deselect it
            if (idToDelete === sessionId) {
                setSessionId(null); // Deselect the chat
                setMessages([]);    // Clear the chat panel
                localStorage.removeItem('chatSessionId');
            }
            
            loadChatList(); // Refresh the list after deletion
        } catch (error) {
            setError(error.message || "Failed to delete chat.");
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const userPrompt = currentPrompt.trim();
        // Check if a session is active before submitting
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
            loadChatList(); // Refresh list to update the title/timestamp of the current chat
        }
    };
    
    return (
        <div style={{ display: 'flex', height: '100vh', margin: '0 auto', maxWidth: '1200px', border: '1px solid #ccc', borderRadius: '8px' }}>
            
            <ChatList 
                sessions={chatList} 
                currentSessionId={sessionId} 
                onSelectChat={handleSelectChat} 
                onDeleteChat={handleDeleteChat}
            /> 
            
            <div className="chat-interface" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f9f9f9' }}>
                
                {sessionId ? (
                    <>
                        <h2 style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                            {chatList.find(c => c.sessionId === sessionId)?.title || "AI Chat"}
                        </h2>
                        
                        <div className="messages-area" style={{ flexGrow: 1, overflowY: 'auto', padding: '15px' }}>
                            {messages.map((message, index) => (
                                <div key={index} style={{ 
                                    margin: '10px 0', 
                                    padding: '8px 12px', 
                                    borderRadius: '15px', 
                                    backgroundColor: message.role === 'user' ? '#dcf8c6' : '#f0f0f0',
                                    maxWidth: '70%',
                                    marginLeft: message.role === 'user' ? 'auto' : '0',
                                    marginRight: message.role === 'model' ? 'auto' : '0',
                                }}>
                                    <strong style={{ textTransform: 'capitalize' }}>{message.role}:</strong>
                                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.content}</p>
                                    {message.isStreaming && <span className="cursor-blink">|</span>}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', backgroundColor: 'white' }}>
                            <input
                                type="text"
                                value={currentPrompt}
                                onChange={(e) => setCurrentPrompt(e.target.value)}
                                placeholder={isLoading ? 'Waiting for response...' : 'Type your message...'}
                                disabled={isLoading || !sessionId}
                                style={{ flexGrow: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '10px' }}
                            />
                            <button type="submit" disabled={isLoading || !sessionId} style={{ padding: '10px 20px', borderRadius: '5px' }}>
                                {isLoading ? 'Sending...' : 'Send'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ flexGrow: 1, display: 'grid', placeItems: 'center', color: '#888' }}>
                        <h2>👋 Select a Conversation or Start a New Chat</h2>
                    </div>
                )}
                
                {error && <p style={{ color: 'red', textAlign: 'center', padding: '10px' }}>Error: {error}</p>}
            </div>
        </div>
    );
}

export default Chat;