import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const navigate = useNavigate();
    const currentUser = localStorage.getItem('currentUser');

    useEffect(() => {
        // Мы убрали блокировку пустого запроса. 
        // Теперь при пустом `query` на сервер уходит q="", и он возвращает всех юзеров.
        const timer = setTimeout(() => {
            fetch(`http://localhost:8080/api/user/search?q=${encodeURIComponent(query)}&currentUser=${currentUser}`)
                .then(res => res.json())
                .then(data => setResults(data))
                .catch(err => console.error("Ошибка поиска:", err));
        }, 300);

        return () => clearTimeout(timer);
    }, [query, currentUser]);

    // const handleAddFriend = async (e, targetUsername) => {
    //     e.stopPropagation();
    //     await fetch(`http://localhost:8080/api/user/friends/request/${targetUsername}?currentUser=${currentUser}`, { method: 'POST' });
    //     setResults(prev => prev.map(u => u.username === targetUsername ? { ...u, friendStatus: 'PENDING' } : u));
    // };

    // const handleRemoveFriend = async (e, targetUsername) => {
    //     e.stopPropagation();
    //     if (!window.confirm(`Точно хотите удалить ${targetUsername} из друзей?`)) return;
    //     await fetch(`http://localhost:8080/api/user/friends/remove/${targetUsername}?currentUser=${currentUser}`, { method: 'POST' });
    //     setResults(prev => prev.map(u => u.username === targetUsername ? { ...u, friendStatus: 'NONE' } : u));
    // };

    return (
        <div className="search-container">

            {/* Поиск */}
            <div className="search-input-wrap">
                <Search className="search-icon" size={22} />
                <input
                    type="text"
                    placeholder="Найти друзей по логину..."
                    className="search-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {/* Результаты */}
            <div className="search-results">
                {results.map(user => (
                    <div
                        key={user.id}
                        onClick={() => navigate(`/main/user/${user.username}`)}
                        className="search-result-item"
                    >
                        {/* Аватар + имя */}
                        <div className="search-result-left">
                            <img
                                src={user.avatarUrl || 'https://via.placeholder.com/48'}
                                alt={user.username}
                                className="search-result-avatar"
                            />
                            <div className="search-result-info">
                                <span className="search-result-name">{user.username}</span>
                                {user.friendStatus === 'ACCEPTED' && (
                                    <span className="search-result-badge badge-friend">Ваш друг</span>
                                )}
                                {user.friendStatus === 'PENDING' && (
                                    <span className="search-result-badge badge-pending">Запрос отправлен</span>
                                )}
                            </div>
                        </div>

                        {/* Кнопки */}

                    </div>
                ))}

                {/* Обновленная логика пустых результатов */}
                {results.length === 0 && (
                    <p className="search-empty">
                        {query ? "Пользователь не найден" : "В приложении пока нет других пользователей"}
                    </p>
                )}
            </div>
        </div>
    );
}