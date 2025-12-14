import React, { useState } from 'react';
import { renameChatSession } from '../apis/chatApi'; 

function ChatList({ sessions, currentSessionId, onSelectChat, onDeleteChat, loadChatList }) {
    
    const [renamingId, setRenamingId] = useState(null);
    const [newTitle, setNewTitle] = useState('');

    const startRename = (sessionId, currentTitle, e) => {
        e.stopPropagation(); 
        setRenamingId(sessionId);
        setNewTitle(currentTitle);
    };

    const handleRenameSubmit = async (e) => {
        e.preventDefault();
        
        const trimmedTitle = newTitle.trim();
        if (!trimmedTitle || !renamingId) return;

        try {
            await renameChatSession(renamingId, trimmedTitle); 
            
            if (loadChatList) {
                loadChatList(); 
            }

        } catch (error) {
            console.error("Failed to rename chat:", error);
            alert("Failed to rename chat session.");
        } finally {
            setRenamingId(null);
            setNewTitle('');
        }
    };

    const handleRenameKeyDown = (e) => {
        if (e.key === 'Escape') {
            setRenamingId(null);
            setNewTitle('');
        }
    }

    return (
        <div className="d-flex flex-column p-3 bg-dark text-white border-end border-secondary" style={{ width: '280px', height: '100vh' }}>
            
            <div className="d-flex align-items-center mb-4 pb-2 border-bottom border-secondary">
                <h3 className="mb-0 text-warning fs-5">✨ NextGen AI</h3>
            </div>
            
            <button 
                onClick={() => onSelectChat('new')} 
                className="btn btn-warning mb-4 w-100 fw-bold rounded-pill"
            >
                + New Chat
            </button>

            <div className="text-muted small mb-2 text-uppercase">
                 Conversations
             </div>

            <div className="overflow-auto flex-grow-1">
                {sessions.map((session) => (
                    <div
                        key={session.sessionId}
                        onClick={renamingId === session.sessionId ? null : () => onSelectChat(session.sessionId)}
                        className={`d-flex flex-column p-2 mb-2 rounded-3 text-break shadow-sm ${
                            session.sessionId === currentSessionId 
                                ? 'bg-warning text-dark fw-bold' 
                                : 'text-light border border-secondary-subtle'
                        }`}
                        style={{ cursor: renamingId === session.sessionId ? 'default' : 'pointer', fontSize: '0.9em', transition: 'background-color 0.2s' }}
                    >
                        {renamingId === session.sessionId ? (
                            <form onSubmit={handleRenameSubmit} className="d-flex align-items-center">
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    onKeyDown={handleRenameKeyDown}
                                    className="form-control form-control-sm me-2"
                                    autoFocus
                                    onFocus={(e) => e.target.select()}
                                />
                                <button type="submit" className="btn btn-sm btn-success p-1">
                                    💾
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setRenamingId(null)}
                                    className="btn btn-sm btn-outline-danger p-1 ms-1"
                                >
                                    ❌
                                </button>
                            </form>
                        ) : (
                            <>
                                <div className="d-flex justify-content-between align-items-center w-100">
                                    <span className="me-2 text-truncate" title={session.title} style={{ maxWidth: '60%' }}>
                                        {session.title}
                                    </span>

                                    <div className="d-flex align-items-center">
                                        
                                        <button 
                                            onClick={(e) => startRename(session.sessionId, session.title, e)}
                                            className={`btn btn-sm btn-link p-0 me-2 ${session.sessionId === currentSessionId ? 'text-dark' : 'text-info'}`}
                                            title="Rename Chat"
                                        >
                                            ✏️
                                        </button>
                                        
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation(); 
                                                onDeleteChat(session.sessionId);
                                            }}
                                            className={`btn btn-sm btn-link p-0 ${session.sessionId === currentSessionId ? 'text-dark' : 'text-danger'}`}
                                            title="Delete Chat"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChatList;