import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserRoundPlus, MessageSquare, Clock, Users, CheckCircle } from 'lucide-react';

export default function PublicProfilePage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const currentUser = localStorage.getItem('currentUser');
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8080/api/user/profile/${username}?currentUser=${currentUser}`)
            .then(res => res.json())
            .then(data => setProfile(data))
            .catch(err => console.error(err));
    }, [username, currentUser]);

    const handleAddFriend = async () => {
        await fetch(`http://localhost:8080/api/user/friends/request/${username}?currentUser=${currentUser}`, { method: 'POST' });
        setProfile(prev => ({ ...prev, friendStatus: 'PENDING' }));
    };

    const handleRemoveFriend = async () => {
        if (!window.confirm(`Точно хотите удалить ${username} из друзей?`)) return;
        await fetch(`http://localhost:8080/api/user/friends/remove/${username}?currentUser=${currentUser}`, { method: 'POST' });
        setProfile(prev => ({ ...prev, friendStatus: 'NONE', friendsCount: Math.max(0, prev.friendsCount - 1) }));
    };

    if (!profile) return <div className="loading-container">Загрузка...</div>;

    if (username === currentUser) {
        return (
            <div className="public-profile">
                <div className="public-profile-card" style={{ textAlign: 'center' }}>
                    <p style={{ color: '#6b7280', marginBottom: '12px' }}>Это ваш публичный профиль.</p>
                    <button onClick={() => navigate('/main/profile')} className="btn btn-primary">
                        Перейти в настройки
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="public-profile">
            <div className="public-profile-card">

                {/* Аватар */}
                <img
                    src={profile.avatarUrl || 'https://via.placeholder.com/140'}
                    alt={profile.username}
                    className="public-profile-avatar"
                />

                {/* Имя */}
                <h2 className="public-profile-name">@{profile.username}</h2>

                {/* Статистика */}
                <div className="public-profile-stats" style={{ marginTop: '16px', marginBottom: '24px' }}>
                    <div className="stat-item">
                        <Users size={16} className="stat-icon" />
                        <span className="stat-label">Друзей:</span>
                        <span className="stat-value" style={{ marginLeft: '6px' }}>{profile.friendsCount}</span>
                    </div>
                </div>

                {/* Кнопки */}
                <div className="public-profile-actions">

                    {/* Написать сообщение */}
                    <button
                        onClick={() => navigate('/main/chat')}
                        disabled={profile.friendStatus !== 'ACCEPTED'}
                        title={profile.friendStatus !== 'ACCEPTED' ? "Сначала добавьте в друзья" : "Перейти в чат"}
                        className={profile.friendStatus === 'ACCEPTED' ? 'btn btn-primary btn-block' : 'btn btn-disabled btn-block'}
                    >
                        <MessageSquare size={18} />
                        Написать
                    </button>

                    {/* ЕДИНАЯ КНОПКА СТАТУСА ДРУЖБЫ */}
                    {profile.friendStatus === 'ACCEPTED' ? (
                        <button 
                            onClick={handleRemoveFriend} 
                            className="btn btn-block" 
                            style={{ backgroundColor: '#10B981', color: 'white', borderColor: '#10B981' }}
                            title="Нажмите, чтобы удалить из друзей"
                        >
                            <CheckCircle size={18} />
                            Вы уже друзья
                        </button>
                    ) : profile.friendStatus === 'PENDING' ? (
                        <button disabled className="btn btn-pending btn-block">
                            <Clock size={18} />
                            Запрос отправлен
                        </button>
                    ) : (
                        <button onClick={handleAddFriend} className="btn btn-secondary btn-block">
                            <UserRoundPlus size={18} />
                            Добавить в друзья
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}