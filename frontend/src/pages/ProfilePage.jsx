import { useState, useEffect } from 'react';

export default function ProfilePage() {
    const [userData, setUserData] = useState({
        username: '', email: '', phoneNumber: '', birthDate: '', avatarUrl: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const currentUser = localStorage.getItem('currentUser');

    // 1. Загрузка данных при открытии страницы
    useEffect(() => {
        fetch(`http://localhost:8080/api/user/${currentUser}`)
            .then(res => res.json())
            .then(data => setUserData(data))
            .catch(err => console.error('Ошибка загрузки профиля:', err));
    }, [currentUser]);

    // 2. Сохранение текстовых данных (телефон, дата)
    const handleSave = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/user/update/${currentUser}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                setIsEditing(false);
                alert('Данные профиля успешно сохранены! 🎉');
            } else {
                const text = await response.text();
                let message = `Ошибка ${response.status}`;
                try {
                    const data = JSON.parse(text);
                    message = data.message || message;
                } catch (e) {
                    console.warn("Ответ не JSON");
                }
                alert(message);
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            alert('Ошибка соединения с сервером');
        }
    };

    // 3. Загрузка фотографии
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`http://localhost:8080/api/user/upload-avatar/${currentUser}`, {
                method: 'POST',
                body: formData // Content-Type браузер подставит сам
            });

            if (response.ok) {
                const data = await response.json();
                // Обновляем картинку на экране
                setUserData({ ...userData, avatarUrl: data.avatarUrl });
                alert('Фото профиля успешно обновлено! 📸');
            } else {
                alert('Ошибка при загрузке фото');
            }
        } catch (error) {
            console.error('Ошибка загрузки фото:', error);
            alert('Ошибка соединения с сервером при отправке файла');
        }
    };

    // 4. Отрисовка интерфейса (JSX)
    return (
        <div className="card profile-card">
            <div className="profile-header">
                <img
                    src={userData.avatarUrl || 'https://via.placeholder.com/100'}
                    alt="Avatar"
                    className="avatar"
                />
                <h2>{userData.username}</h2>
                <p className="email-text">{userData.email}</p>
            </div>

            <div className="profile-details">
                <label>Телефон:</label>
                {isEditing ? (
                    <input type="text" value={userData.phoneNumber || ''}
                        onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })} />
                ) : (
                    <p>{userData.phoneNumber || 'Не указан'}</p>
                )}

                <label>Дата рождения:</label>
                {isEditing ? (
                    <input type="date" value={userData.birthDate || ''}
                        onChange={(e) => setUserData({ ...userData, birthDate: e.target.value })} />
                ) : (
                    <p>{userData.birthDate || 'Не указана'}</p>
                )}

                {isEditing && (
                    <>
                        <label>Фото профиля (выбрать с устройства):</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            style={{ border: 'none', padding: '10px 0', cursor: 'pointer' }}
                        />
                    </>
                )}
            </div>

            <button onClick={isEditing ? handleSave : () => setIsEditing(true)}>
                {isEditing ? 'Сохранить изменения' : 'Редактировать профиль'}
            </button>
        </div>
    );
}