function ChatList({ sessions, currentSessionId, onSelectChat, onDeleteChat }) {
    // Note: We use the 'className' attribute for Bootstrap classes.
    return (
        // Container: Set width, padding, flex column, and border (using Bootstrap's border utilities)
        <div className="d-flex flex-column p-3 border-end" style={{ width: '250px', height: '100vh' }}>
            <h3 className="mb-3">📝 Conversations</h3>
            
            {/* Start New Chat Button */}
            <button 
                onClick={() => onSelectChat('new')} 
                // Bootstrap classes for primary button, full width, margin bottom
                className="btn btn-primary mb-3 w-100"
            >
                + Start New Chat
            </button>

            {/* Scrollable List Area */}
            <div className="overflow-auto flex-grow-1">
                {sessions.map((session) => (
                    <div
                        key={session.sessionId}
                        onClick={() => onSelectChat(session.sessionId)}
                        // List Item Styling: 
                        // d-flex (flex), align-items-center, justify-content-between
                        // p-2 (padding), mb-2 (margin bottom), rounded-3 (rounded corners)
                        // cursor: pointer is needed as a custom style since Bootstrap doesn't have a direct class for this
                        className={`d-flex align-items-center justify-content-between p-2 mb-2 rounded-3 text-break ${
                            // Conditional Class for Active Session
                            session.sessionId === currentSessionId 
                                ? 'bg-primary-subtle border border-primary text-primary' // Active style
                                : 'text-dark border border-light-subtle' // Default style
                        }`}
                        style={{ cursor: 'pointer', fontSize: '0.9em' }}
                    >
                        {/* Title Span */}
                        <span className="me-2" title={session.title}>
                            {session.title}
                        </span>
                        
                        {/* Delete Button */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent opening the chat when deleting
                                onDeleteChat(session.sessionId);
                            }}
                            // Use Bootstrap text-danger for color and background: none for the clear button look
                            className="btn btn-sm btn-link p-0 text-danger ms-2"
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