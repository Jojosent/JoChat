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
            return;
        }

        const timer = setTimeout(() => {
            fetch(`http://localhost:8080/api/user/search?q=${query}`)
                .then(res => res.json())
                .then(data => {
                    setResults(data.filter(u => u.username !== currentUser));
                })
                .catch(err => console.error(err));
        }, 300);

        return () => clearTimeout(timer);
    }, [query, currentUser]);

    return (
        <div className="search-container">
            <div className="search-input-wrap">
                <Search className="search-icon" size={22} />
                <input
                    type="text"
                    placeholder="Search users..."
                    className="search-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            <div className="search-results">
                {results.map(user => (
                    <div
                        key={user.id}
                        onClick={() => navigate(`/main/user/${user.username}`)}
                        className="search-result-item"
                    >
                        <img
                            src={user.avatarUrl || 'https://via.placeholder.com/56'}
                            alt={user.username}
                            className="search-result-avatar"
                        />
                        <span className="search-result-name">{user.username}</span>
                    </div>
                ))}
                {query && results.length === 0 && (
                    <p className="search-empty">No users found</p>
                )}
            </div>
        </div>
    );
}
