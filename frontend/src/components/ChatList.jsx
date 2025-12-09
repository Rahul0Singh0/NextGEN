import React from 'react';

function ChatList({ sessions, currentSessionId, onSelectChat, onDeleteChat }) {
    return (
        <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '10px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={{ marginBottom: '15px' }}>📝 Conversations</h3>
            
            <button 
                onClick={() => onSelectChat('new')} 
                style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
                + Start New Chat
            </button>

            <div style={{ overflowY: 'auto', flexGrow: 1 }}>
                {sessions.map((session) => (
                    <div
                        key={session.sessionId}
                        style={{
                            padding: '10px',
                            marginBottom: '8px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            backgroundColor: session.sessionId === currentSessionId ? '#e6f7ff' : 'transparent',
                            border: session.sessionId === currentSessionId ? '1px solid #91d5ff' : '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.9em'
                        }}
                        onClick={() => onSelectChat(session.sessionId)}
                    >
                        <span title={session.title}>
                            {session.title}
                        </span>
                        
                        {/* Delete Button */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent opening the chat when deleting
                                onDeleteChat(session.sessionId);
                            }}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: 'red', 
                                cursor: 'pointer', 
                                padding: '5px',
                                fontSize: '1em',
                                marginLeft: '5px'
                            }}
                            title="Delete Chat"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChatList;