import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageCircle, UserRoundPlus } from 'lucide-react';

export default function PublicProfilePage() {
    const { username } = useParams(); // Логин из URL
    const currentUser = localStorage.getItem('currentUser');
    const [profile, setProfile] = useState(null);
    const [requestSent, setRequestSent] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:8080/api/user/profile/${username}?currentUser=${currentUser}`)
            .then(res => res.json())
            .then(data => setProfile(data))
            .catch(err => console.error(err));
    }, [username, currentUser]);

    // Логика запроса в друзья (Add Friend)
    const handleSendRequest = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/user/friends/request/${username}?currentUser=${currentUser}`, {
                method: 'POST'
            });
            if (response.ok) {
                setRequestSent(true);
                alert("Запрос в друзья отправлен!");
            }
        } catch (error) {
            console.error("Ошибка при отправке запроса", error);
        }
    };

    if (!profile) return <div className="text-center p-10">Загрузка...</div>;

    return (
        <div className="flex flex-col items-center text-center max-w-md mx-auto p-4">
            {/* Аватар */}
            <img
                src={profile.avatarUrl || 'https://via.placeholder.com/120'}
                alt={profile.username}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mb-4"
            />
            
            <h2 className="text-2xl font-bold mb-6">@{profile.username}</h2>

            {/* Основные действия */}
            <div className="grid grid-cols-2 gap-3 w-full mb-3">

                {/* Кнопка Сообщения */}
                <button
                    onClick={() => alert("Функция сообщений будет добавлена позже!")}
                    className="noise-glass py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] border border-white/10"
                >
                    <MessageCircle size={20} />
                    Сообщение
                </button>
            </div>

            {/* Кнопка Добавления в друзья (на всю ширину) */}
            <button
                onClick={handleSendRequest}
                disabled={requestSent}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    requestSent 
                    ? 'bg-green-100 text-green-700 cursor-default' 
                    : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg'
                }`}
            >
                <UserRoundPlus size={20} />
                {requestSent ? 'Запрос отправлен' : 'Добавить в друзья'}
            </button>
        </div>
    );
}