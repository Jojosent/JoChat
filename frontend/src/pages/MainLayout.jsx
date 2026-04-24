import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { MessageCircle, User, LogOut, Search, Bell} from 'lucide-react';
import { MessageSquare } from 'lucide-react';

export default function MainLayout() {
    const navigate = useNavigate();

    const [pendingRequests, setPendingRequests] = useState([]);
    // const [showNotifications, setShowNotifications] = useState(false);
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

    // const handleRespond = async (id, action) => {
    //     try {
    //         const response = await fetch(`http://localhost:8080/api/user/friends/respond/${id}?action=${action}`, {
    //             method: 'POST'
    //         });

    //         if (response.ok) {
    //             setPendingRequests(prev => prev.filter(r => r.requestId !== id));
    //         }
    //     } catch (error) {
    //         console.error("Ошибка при обработке заявки:", error);
    //     }
    // };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/');
    };

    return (
        <div className="layout min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col">

            <nav className="navbar bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50" aria-label="Главная навигация">
                <div className="navbar-inner max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

                    {/* Brand */}
                    <div
                        className="nav-brand flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => navigate('/main/profile')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') navigate('/main/profile'); }}
                    >
                        <div className="nav-brand-mark bg-blue-600 text-white w-[30px] h-[30px] rounded-lg flex items-center justify-center shrink-0" aria-hidden="true">
                            <MessageCircle size={18} strokeWidth={2.25} />
                        </div>
                        <span className="nav-brand-name font-bold text-[17px] tracking-tight dark:text-white">JoChat</span>
                    </div>

                    {/* Links */}
                    <div className="nav-links flex items-center gap-1">

                        {/* Search */}
                        <button
                            type="button"
                            className="nav-link flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                            onClick={() => navigate('/main/search')}
                        >
                            <Search size={16} strokeWidth={2} />
                            <span>Поиск</span>
                        </button>
                        {/* Chat */}
                        <button
                            onClick={() => navigate('/main/chat')}
                            className="p-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all text-zinc-600 dark:text-zinc-400"
                            title="Сообщения"
                        >
                            <MessageSquare size={20} />
                        </button>

                        {/* Notifications */}
                        <button
                            onClick={() => navigate('/main/notifications')}
                            className={`p-2.5 rounded-xl transition-all relative ${location.pathname === '/main/notifications'
                                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                        >
                            <Bell size={20} />
                            {pendingRequests.length > 0 && (
                                <span className="absolute top-2.5 right-2.5 bg-red-500 w-2 h-2 rounded-full border-2 border-white dark:border-zinc-900"></span>
                            )}
                        </button>
                        <div className="w-px h-5 bg-gray-200 dark:bg-zinc-800 mx-1" aria-hidden="true" />

                        {/* Profile */}
                        <button
                            type="button"
                            className={`nav-link flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            onClick={() => navigate('/main/profile')}
                        >
                            <User size={16} strokeWidth={2} />
                            <span>{currentUser}</span>
                        </button>

                        {/* Logout */}
                        <button
                            type="button"
                            className="nav-logout flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors"
                            onClick={handleLogout}
                        >
                            <LogOut size={16} strokeWidth={2} />
                            <span>Выйти</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="content flex-1 max-w-7xl mx-auto w-full p-4">
                <Outlet />
            </main>
        </div>
    );
}