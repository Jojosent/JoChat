import { useState, useEffect } from 'react';
import {
    Mail,
    Phone,
    Calendar,
    Camera,
    Pencil,
    Save,
    X,
    UserCircle2,
} from 'lucide-react';

export default function ProfilePage() {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        phoneNumber: '',
        birthDate: '',
        avatarUrl: '',
    });
    const [draft, setDraft] = useState(userData);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const currentUser = localStorage.getItem('currentUser');

    // Load profile data on mount
    useEffect(() => {
        if (!currentUser) return;
        fetch(`http://localhost:8080/api/user/${currentUser}`)
            .then((res) => res.json())
            .then((data) => {
                setUserData(data);
                setDraft(data);
            })
            .catch((err) => console.error('Ошибка загрузки профиля:', err));
    }, [currentUser]);

    const handleEdit = () => {
        setDraft(userData);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setDraft(userData);
        setIsEditing(false);
    };

    // Save text fields
    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            const response = await fetch(
                `http://localhost:8080/api/user/update/${currentUser}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(draft),
                }
            );

            if (response.ok) {
                setUserData(draft);
                setIsEditing(false);
                alert('Данные профиля успешно сохранены!');
            } else {
                const text = await response.text();
                let message = `Ошибка ${response.status}`;
                try {
                    const data = JSON.parse(text);
                    message = data.message || message;
                } catch {
                    // non-JSON response
                }
                alert(message);
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            alert('Ошибка соединения с сервером');
        } finally {
            setIsSaving(false);
        }
    };

    // Avatar upload
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(
                `http://localhost:8080/api/user/upload-avatar/${currentUser}`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (response.ok) {
                const data = await response.json();
                const updated = { ...userData, avatarUrl: data.avatarUrl };
                setUserData(updated);
                setDraft((prev) => ({ ...prev, avatarUrl: data.avatarUrl }));
                alert('Фото профиля успешно обновлено!');
            } else {
                alert('Ошибка при загрузке фото');
            }
        } catch (error) {
            console.error('Ошибка загрузки фото:', error);
            alert('Ошибка соединения с сервером при отправке файла');
        }
    };

    const avatarFallback =
        'data:image/svg+xml;utf8,' +
        encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 112 112"><rect width="112" height="112" fill="%23eef2ff"/><circle cx="56" cy="44" r="20" fill="%234f46e5"/><path d="M20 104c0-19.882 16.118-36 36-36s36 16.118 36 36" fill="%234f46e5"/></svg>`
        );

    const formatDate = (iso) => {
        if (!iso) return '';
        try {
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) return iso;
            return d.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return iso;
        }
    };

    return (
        <div className="profile-wrap">
            {/* Hero */}
            <section className="profile-hero">
                <div className="profile-cover" aria-hidden="true" />
                <div className="profile-hero-body">
                    <div className="avatar-wrap">
                        <img
                            src={userData.avatarUrl || avatarFallback}
                            alt={userData.username ? `Аватар ${userData.username}` : 'Аватар'}
                            className="avatar"
                        />
                        <label
                            className="avatar-upload-btn"
                            title="Загрузить новое фото"
                            aria-label="Загрузить новое фото"
                        >
                            <Camera size={16} strokeWidth={2.25} />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                            />
                        </label>
                    </div>

                    <div className="profile-identity">
                        <h1 className="profile-name">
                            {userData.username || 'Без имени'}
                        </h1>
                        <p className="profile-email">
                            <Mail size={14} />
                            <span>{userData.email || 'email не указан'}</span>
                        </p>
                    </div>

                    <div className="profile-actions">
                        {!isEditing ? (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleEdit}
                            >
                                <Pencil size={16} />
                                Редактировать
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                >
                                    <X size={16} />
                                    Отмена
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    <Save size={16} />
                                    {isSaving ? 'Сохранение…' : 'Сохранить'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Details */}
            <section className="profile-section">
                <header className="profile-section-header">
                    <div>
                        <h2 className="profile-section-title">Личная информация</h2>
                        <p className="profile-section-subtitle">
                            Обновите контактные данные и дату рождения
                        </p>
                    </div>
                </header>

                <div className="profile-fields">
                    <div className="profile-row">
                        <div className="profile-row-label">
                            <UserCircle2 size={16} />
                            Логин
                        </div>
                        <div className="profile-row-value">
                            {userData.username || '—'}
                        </div>
                    </div>

                    <div className="profile-row">
                        <div className="profile-row-label">
                            <Mail size={16} />
                            Email
                        </div>
                        <div className="profile-row-value">
                            {userData.email || '—'}
                        </div>
                    </div>

                    <div className="profile-row">
                        <div className="profile-row-label">
                            <Phone size={16} />
                            Телефон
                        </div>
                        <div className="profile-row-value profile-row-control">
                            {isEditing ? (
                                <input
                                    className="input input-no-icon"
                                    type="tel"
                                    placeholder="+7 000 000 00 00"
                                    value={draft.phoneNumber || ''}
                                    onChange={(e) =>
                                        setDraft({ ...draft, phoneNumber: e.target.value })
                                    }
                                />
                            ) : userData.phoneNumber ? (
                                <span>{userData.phoneNumber}</span>
                            ) : (
                                <span className="is-empty">Не указан</span>
                            )}
                        </div>
                    </div>

                    <div className="profile-row">
                        <div className="profile-row-label">
                            <Calendar size={16} />
                            Дата рождения
                        </div>
                        <div className="profile-row-value profile-row-control">
                            {isEditing ? (
                                <input
                                    className="input input-no-icon"
                                    type="date"
                                    value={draft.birthDate || ''}
                                    onChange={(e) =>
                                        setDraft({ ...draft, birthDate: e.target.value })
                                    }
                                />
                            ) : userData.birthDate ? (
                                <span>{formatDate(userData.birthDate)}</span>
                            ) : (
                                <span className="is-empty">Не указана</span>
                            )}
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="section-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCancel}
                            disabled={isSaving}
                        >
                            Отмена
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <Save size={16} />
                            {isSaving ? 'Сохранение…' : 'Сохранить изменения'}
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
