import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    MessageCircle,
    User,
    LogOut,
    Search,
    Bell,
    Check,
    X
} from 'lucide-react';

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    const [pendingRequests, setPendingRequests] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const currentUser = localStorage.getItem('currentUser');

    // Загрузка заявок в друзья
    useEffect(() => {
        if (!currentUser) return;

        const fetchRequests = () => {
            fetch(`http://localhost:8080/api/user/friends/pending?currentUser=${currentUser}`)
                .then(res => res.json())
                .then(data => setPendingRequests(data))
                .catch(err => console.error("Ошибка загрузки заявок:", err));
        };

        fetchRequests();
        const interval = setInterval(fetchRequests, 30000);
        return () => clearInterval(interval);
    }, [currentUser]);

    const handleRespond = async (id, action) => {
        try {
            const response = await fetch(`http://localhost:8080/api/user/friends/respond/${id}?action=${action}`, {
                method: 'POST'
            });

            if (response.ok) {
                setPendingRequests(prev => prev.filter(r => r.requestId !== id));
            }
        } catch (error) {
            console.error("Ошибка при обработке заявки:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col">
            {/* Навигация */}
            <nav className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

                    {/* Лого */}
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/main/profile')}
                    >
                        <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                            <MessageCircle size={20} />
                        </div>
                        <span className="font-bold text-xl dark:text-white">JoChat</span>
                    </div>

                    {/* Ссылки */}
                    <div className="flex items-center gap-2">

                        {/* Поиск */}
                        <button
                            onClick={() => navigate('/main/search')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full dark:text-gray-300 transition-colors"
                        >
                            <Search size={20} />
                        </button>

                        {/* Уведомления (Упрощенный выпадающий список) */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full dark:text-gray-300 relative transition-colors"
                            >
                                <Bell size={20} />
                                {pendingRequests.length > 0 && (
                                    <span className="absolute top-1.5 right-1.5 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-900"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                    <div className="p-4 font-bold border-b border-gray-100 dark:border-zinc-800 dark:text-white">
                                        Заявки в друзья
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {pendingRequests.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500 text-sm">
                                                Нет новых уведомлений
                                            </div>
                                        ) : (
                                            pendingRequests.map(req => (
                                                <div key={req.requestId} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                                    <div className="flex items-center gap-3">
                                                        <img src={req.senderAvatar || 'https://via.placeholder.com/32'} className="w-8 h-8 rounded-full object-cover" />
                                                        <span className="text-sm font-medium dark:text-white">{req.senderName}</span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleRespond(req.requestId, 'accept')}
                                                            className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRespond(req.requestId, 'reject')}
                                                            className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-[1px] h-6 bg-gray-200 dark:bg-zinc-800 mx-2"></div>

                        {/* Профиль и Выход */}
                        <button
                            onClick={() => navigate('/main/profile')}
                            className="flex items-center gap-2 p-1.5 pr-3 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User size={18} className="text-gray-600" />
                            </div>
                            <span className="text-sm font-medium dark:text-gray-200">{currentUser}</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Выйти"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Основной контент */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-4">
                <Outlet />
            </main>
        </div>
    );
}