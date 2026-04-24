import { useState, useEffect } from 'react';
import { Check, X, BellOff, UserPlus } from 'lucide-react';

export default function NotificationsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = localStorage.getItem('currentUser');

    const fetchRequests = () => {
        fetch(`http://localhost:8080/api/user/friends/pending?currentUser=${currentUser}`)
            .then(res => res.json())
            .then(data => {
                setRequests(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchRequests();
    }, [currentUser]);

    const handleRespond = async (id, action) => {
        const response = await fetch(`http://localhost:8080/api/user/friends/respond/${id}?action=${action}`, {
            method: 'POST'
        });
        if (response.ok) {
            setRequests(prev => prev.filter(r => r.requestId !== id));
        }
    };

    if (loading) return <div className="text-center py-10 dark:text-white">Загрузка...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                Уведомления
                {requests.length > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {requests.length}
                    </span>
                )}
            </h1>

            <div className="space-y-3">
                {requests.length === 0 ? (
                    <div className="bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center">
                        <BellOff className="mx-auto text-zinc-400 mb-4" size={48} />
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Новых уведомлений нет</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.requestId} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img
                                        src={req.senderAvatar || 'https://via.placeholder.com/48'}
                                        className="w-12 h-12 rounded-full object-cover border border-zinc-100 dark:border-zinc-700"
                                        alt="avatar"
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white dark:border-zinc-900">
                                        <UserPlus size={10} />
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold dark:text-white">@{req.senderName}</p>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Хочет добавить вас в друзья</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleRespond(req.requestId, 'accept')}
                                    className="bg-blue-500 hover:bg-blue-600 text-white p-2.5 rounded-xl transition-colors"
                                    title="Принять"
                                >
                                    <Check size={20} />
                                </button>
                                <button
                                    onClick={() => handleRespond(req.requestId, 'reject')}
                                    className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-red-500 hover:text-white p-2.5 rounded-xl transition-colors"
                                    title="Отклонить"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}