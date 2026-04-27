import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle, Plus, X, Users, Check, Hash } from 'lucide-react';

export default function ChatPage() {
    const [friends, setFriends] = useState([]);
    const [groups, setGroups] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const currentUser = localStorage.getItem('currentUser');

    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedFriends, setSelectedFriends] = useState([]);

    const fetchChatsData = useCallback(async () => {
        try {
            const [friendsRes, groupsRes] = await Promise.all([
                fetch(`http://localhost:8080/api/chat/friends?currentUser=${currentUser}`),
                fetch(`http://localhost:8080/api/groups/my?username=${currentUser}`)
            ]);

            const friendsData = await friendsRes.json();
            const groupsData = await groupsRes.json();

            return { friendsData, groupsData }; // Просто возвращаем результат
        } catch (error) {
            console.error("Ошибка загрузки чатов:", error);
            return { friendsData: [], groupsData: [] };
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            fetchChatsData().then(({ friendsData, groupsData }) => {
                setFriends(friendsData);
                setGroups(groupsData);
            });
        }
    }, [currentUser, fetchChatsData]);

    // Автоскролл
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 3. Отправка сообщения (УМНАЯ)
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        // Выбираем правильный URL для отправки
        const url = activeChat.isGroup
            ? `http://localhost:8080/api/chat/sendGroup?sender=${currentUser}&groupId=${activeChat.id}`
            : `http://localhost:8080/api/chat/send?sender=${currentUser}&receiver=${activeChat.username}`;

        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage })
            });

            // Локально добавляем сообщение, чтобы не ждать поллинга
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: currentUser,
                content: newMessage,
                timestamp: new Date().toISOString()
            }]);
            setNewMessage('');
        } catch (error) {
            console.error("Ошибка отправки:", error);
        }
    };

    // --- ФУНКЦИИ ГРУПП ---
    const toggleFriendSelection = (username) => {
        setSelectedFriends(prev =>
            prev.includes(username)
                ? prev.filter(name => name !== username)
                : [...prev, username]
        );
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedFriends.length === 0) return;

        try {
            const response = await fetch(`http://localhost:8080/api/groups/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: groupName,
                    creator: currentUser,
                    members: selectedFriends
                })
            });

            if (response.ok) {
                setIsCreatingGroup(false);
                setGroupName('');
                setSelectedFriends([]);

                // НОВОЕ: Обновляем списки слева после создания через .then()
                fetchChatsData().then(({ friendsData, groupsData }) => {
                    setFriends(friendsData);
                    setGroups(groupsData);
                });
            }
        } catch (error) {
            console.error("Ошибка при создании группы:", error);
        }
    };

    // Объединяем группы и друзей для левой панели
    const allChats = [...groups, ...friends];

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm relative">

            {/* ЛЕВАЯ ПАНЕЛЬ */}
            <div className="w-1/3 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50 dark:bg-zinc-950/50">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900">
                    <span className="font-bold dark:text-white">Чаты</span>
                    <button
                        onClick={() => setIsCreatingGroup(true)}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
                        title="Создать группу"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {allChats.map(chat => {
                        // Определяем, активен ли этот чат прямо сейчас
                        const isActive = activeChat &&
                            ((chat.isGroup && activeChat.isGroup && activeChat.id === chat.id) ||
                                (!chat.isGroup && !activeChat.isGroup && activeChat.username === chat.username));

                        return (
                            <div
                                key={chat.isGroup ? `group-${chat.id}` : `friend-${chat.username}`}
                                onClick={() => setActiveChat(chat)}
                                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-zinc-100 dark:border-zinc-800/50 ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-500/10'
                                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                    }`}
                            >
                                {/* Аватарка: для групп иконка, для друзей фото */}
                                {chat.isGroup ? (
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center">
                                        <Hash size={20} />
                                    </div>
                                ) : (
                                    <img src={chat.avatarUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
                                )}

                                <span className={`font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'dark:text-zinc-200'}`}>
                                    {chat.isGroup ? chat.name : chat.username}
                                </span>
                            </div>
                        );
                    })}
                    {allChats.length === 0 && (
                        <div className="p-6 text-center text-zinc-400 text-sm">Нет доступных чатов</div>
                    )}
                </div>
            </div>

            {/* ПРАВАЯ ПАНЕЛЬ */}
            <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900">
                {activeChat ? (
                    <>
                        {/* Шапка чата */}
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
                            {activeChat.isGroup ? (
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center">
                                    <Users size={20} />
                                </div>
                            ) : (
                                <img src={activeChat.avatarUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
                            )}
                            <span className="font-bold dark:text-white">
                                {activeChat.isGroup ? activeChat.name : activeChat.username}
                            </span>
                        </div>

                        {/* Сообщения */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-[#0b0b0b]">
                            {messages.map(msg => {
                                const isMe = msg.sender === currentUser;
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>

                                        {/* Имя отправителя в групповом чате */}
                                        {activeChat.isGroup && !isMe && (
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1 mb-1 font-medium">
                                                {msg.sender}
                                            </span>
                                        )}

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

            {/* --- МОДАЛЬНОЕ ОКНО СОЗДАНИЯ ГРУППЫ (Без изменений) --- */}
            {isCreatingGroup && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 className="font-bold text-lg flex items-center gap-2 dark:text-white">
                                <Users size={20} className="text-blue-500" />
                                Создать группу
                            </h3>
                            <button onClick={() => setIsCreatingGroup(false)} className="text-zinc-400 hover:text-red-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-5 flex-1 overflow-y-auto">
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">Название группы</label>
                                <input
                                    type="text"
                                    placeholder="Например: Разработчики JoChat"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 dark:text-white border border-transparent focus:border-blue-500 rounded-xl px-4 py-3 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">Выберите участников ({selectedFriends.length})</label>
                                <div className="space-y-2">
                                    {friends.length === 0 ? (
                                        <p className="text-sm text-zinc-500 italic">У вас пока нет друзей для добавления.</p>
                                    ) : (
                                        friends.map(friend => {
                                            const isSelected = selectedFriends.includes(friend.username);
                                            return (
                                                <div
                                                    key={friend.username}
                                                    onClick={() => toggleFriendSelection(friend.username)}
                                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${isSelected
                                                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30'
                                                        : 'bg-white border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <img src={friend.avatarUrl || 'https://via.placeholder.com/32'} className="w-8 h-8 rounded-full object-cover" alt="avatar" />
                                                        <span className={`font-medium ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-200'}`}>{friend.username}</span>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-zinc-300 dark:border-zinc-600'
                                                        }`}>
                                                        {isSelected && <Check size={14} strokeWidth={3} />}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex gap-3">
                            <button onClick={() => setIsCreatingGroup(false)} className="flex-1 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">Отмена</button>
                            <button onClick={handleCreateGroup} disabled={!groupName.trim() || selectedFriends.length === 0} className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Создать</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}