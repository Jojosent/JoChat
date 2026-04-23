import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const navigate = useNavigate();
    const currentUser = localStorage.getItem('currentUser');

    useEffect(() => {
        if (query.trim().length === 0) {
            setResults([]);
            return;
        }

        const timer = setTimeout(() => {
            fetch(`http://localhost:8080/api/user/search?q=${query}`)
                .then(res => res.json())
                .then(data => {
                    // Исключаем самого себя из результатов
                    setResults(data.filter(u => u.username !== currentUser));
                })
                .catch(err => console.error(err));
        }, 300); // Небольшая задержка, чтобы не спамить запросами при вводе

        return () => clearTimeout(timer);
    }, [query, currentUser]);

    return (
        <div className="w-full">
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Найти пользователей..."
                    className="w-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-3">
                {results.map(user => (
                    <div
                        key={user.id}
                        onClick={() => navigate(`/main/user/${user.username}`)}
                        className="noise-glass p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform"
                    >
                        <img
                            src={user.avatarUrl || 'https://via.placeholder.com/50'}
                            alt={user.username}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                        />
                        <span className="font-semibold text-lg">{user.username}</span>
                    </div>
                ))}
                {query && results.length === 0 && (
                    <p className="text-center text-gray-500 mt-4">Ничего не найдено</p>
                )}
            </div>
        </div>
    );
}