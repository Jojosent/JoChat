import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react'; // Убрали UserIcon, добавили MessageCircle

export default function ChatPage() {
    const [friends, setFriends] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const currentUser = localStorage.getItem('currentUser');

    // 1. Загрузка списка друзей при открытии страницы
    useEffect(() => {
        if (!currentUser) return;
        fetch(`http://localhost:8080/api/chat/friends?currentUser=${currentUser}`)
            .then(res => res.json())
            .then(data => setFriends(data))
            .catch(err => console.error("Ошибка загрузки друзей:", err));
    }, [currentUser]);

    // 2. Поллинг сообщений выбранного чата
    useEffect(() => {
        if (!activeChat) return;

        const fetchMessages = () => {
            fetch(`http://localhost:8080/api/chat/history?user1=${currentUser}&user2=${activeChat.username}`)
                .then(res => res.json())
                .then(data => setMessages(data))
                .catch(err => console.error("Ошибка загрузки истории:", err));
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 2000);
        return () => clearInterval(interval);
    }, [activeChat, currentUser]);

    // 3. Автоскролл
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 4. Отправка сообщения
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
            // Локально обновляем стейт для мгновенной реакции (опционально)
            setMessages(prev => [...prev, {
                id: Date.now(), // временный ID
                sender: currentUser,
                content: newMessage,
                timestamp: new Date().toISOString()
            }]);
        } catch (error) {
            console.error("Ошибка отправки:", error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">

            {/* ЛЕВАЯ ПАНЕЛЬ: Список друзей */}
            <div className="w-1/3 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50 dark:bg-zinc-950/50">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 font-bold dark:text-white">
                    Чаты ({friends.length})
                </div>
                <div className="flex-1 overflow-y-auto">
                    {friends.map(friend => (
                        <div
                            key={friend.username}
                            onClick={() => setActiveChat(friend)}
                            className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-zinc-100 dark:border-zinc-800/50 ${activeChat?.username === friend.username
                                    ? 'bg-blue-50 dark:bg-blue-500/10'
                                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                        >
                            <img src={friend.avatarUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
                            <span className={`font-medium ${activeChat?.username === friend.username ? 'text-blue-600 dark:text-blue-400' : 'dark:text-zinc-200'}`}>
                                {friend.username}
                            </span>
                        </div>
                    ))}
                    {friends.length === 0 && (
                        <div className="p-6 text-center text-zinc-400 text-sm">У вас пока нет друзей. Найдите их в поиске!</div>
                    )}
                </div>
            </div>

            {/* ПРАВАЯ ПАНЕЛЬ: Окно чата */}
            <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900">
                {activeChat ? (
                    <>
                        {/* Шапка чата */}
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
                            <img src={activeChat.avatarUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
                            <span className="font-bold dark:text-white">{activeChat.username}</span>
                        </div>

                        {/* Сообщения */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-[#0b0b0b]">
                            {messages.map(msg => {
                                const isMe = msg.sender === currentUser;
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${isMe
                                                ? 'bg-blue-500 text-white rounded-br-none'
                                                : 'bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 rounded-bl-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Поле ввода */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
                            <input
                                type="text"
                                placeholder="Написать сообщение..."
                                className="flex-1 bg-zinc-100 dark:bg-zinc-800 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl transition-colors disabled:opacity-50" disabled={!newMessage.trim()}>
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
                            <MessageCircle size={32} />
                        </div>
                        <p>Выберите чат, чтобы начать общение</p>
                    </div>
                )}
            </div>
        </div>
    );
}