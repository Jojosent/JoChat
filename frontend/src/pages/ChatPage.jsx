import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';

export default function ChatPage() {
    const [friends, setFriends] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const currentUser = localStorage.getItem('currentUser');

    // Load friends list
    useEffect(() => {
        if (!currentUser) return;
        fetch(`http://localhost:8080/api/chat/friends?currentUser=${currentUser}`)
            .then(res => res.json())
            .then(data => setFriends(data))
            .catch(err => console.error("Error loading friends:", err));
    }, [currentUser]);

    // Poll messages
    useEffect(() => {
        if (!activeChat) return;

        const fetchMessages = () => {
            fetch(`http://localhost:8080/api/chat/history?user1=${currentUser}&user2=${activeChat.username}`)
                .then(res => res.json())
                .then(data => setMessages(data))
                .catch(err => console.error("Error loading history:", err));
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 2000);
        return () => clearInterval(interval);
    }, [activeChat, currentUser]);

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Send message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        try {
            await fetch(`http://localhost:8080/api/chat/send?sender=${currentUser}&receiver=${activeChat.username}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage })
            });
            setNewMessage('');
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: currentUser,
                content: newMessage,
                timestamp: new Date().toISOString()
            }]);
        } catch (error) {
            console.error("Error sending:", error);
        }
    };

    return (
        <div className="chat-container">
            {/* Sidebar */}
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    Chats ({friends.length})
                </div>
                <div className="chat-list">
                    {friends.map(friend => (
                        <div
                            key={friend.username}
                            onClick={() => setActiveChat(friend)}
                            className={`chat-list-item ${activeChat?.username === friend.username ? 'active' : ''}`}
                        >
                            <img 
                                src={friend.avatarUrl || 'https://via.placeholder.com/48'} 
                                className="chat-list-avatar" 
                                alt={friend.username} 
                            />
                            <span className="chat-list-name">{friend.username}</span>
                        </div>
                    ))}
                    {friends.length === 0 && (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
                            No friends yet. Find them in search!
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="chat-main">
                {activeChat ? (
                    <>
                        <div className="chat-header">
                            <img 
                                src={activeChat.avatarUrl || 'https://via.placeholder.com/48'} 
                                className="chat-list-avatar" 
                                alt={activeChat.username} 
                            />
                            <span className="chat-list-name">{activeChat.username}</span>
                        </div>

                        <div className="chat-messages">
                            {messages.map(msg => {
                                const isMe = msg.sender === currentUser;
                                return (
                                    <div key={msg.id} className={`chat-message ${isMe ? 'sent' : 'received'}`}>
                                        <div className="chat-bubble">
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="chat-input-container">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="chat-input"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button 
                                type="submit" 
                                className="chat-send-btn" 
                                disabled={!newMessage.trim()}
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="chat-empty">
                        <div className="chat-empty-icon">
                            <MessageCircle size={36} />
                        </div>
                        <p>Select a chat to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}
