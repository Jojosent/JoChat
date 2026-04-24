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

    useEffect(() => {
        if (!currentUser) return;
        fetch(`http://localhost:8080/api/user/${currentUser}`)
            .then((res) => res.json())
            .then((data) => {
                setUserData(data);
                setDraft(data);
            })
            .catch((err) => console.error('Error loading profile:', err));
    }, [currentUser]);

    const handleEdit = () => {
        setDraft(userData);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setDraft(userData);
        setIsEditing(false);
    };

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
                alert('Profile saved successfully!');
            } else {
                const text = await response.text();
                let message = `Error ${response.status}`;
                try {
                    const data = JSON.parse(text);
                    message = data.message || message;
                } catch {
                    // non-JSON response
                }
                alert(message);
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Connection error');
        } finally {
            setIsSaving(false);
        }
    };

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
                alert('Profile photo updated!');
            } else {
                alert('Error uploading photo');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Connection error');
        }
    };

    const avatarFallback =
        'data:image/svg+xml;utf8,' +
        encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="%2327272a"/><circle cx="60" cy="48" r="22" fill="%23a78bfa"/><path d="M20 112c0-22.09 17.91-40 40-40s40 17.91 40 40" fill="%23a78bfa"/></svg>`
        );

    const formatDate = (iso) => {
        if (!iso) return '';
        try {
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) return iso;
            return d.toLocaleDateString('en-US', {
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
                            alt={userData.username ? `${userData.username}'s avatar` : 'Avatar'}
                            className="avatar"
                        />
                        <label
                            className="avatar-upload-btn"
                            title="Upload new photo"
                            aria-label="Upload new photo"
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
                            {userData.username || 'No name'}
                        </h1>
                        <p className="profile-email">
                            <Mail size={14} />
                            <span>{userData.email || 'Email not set'}</span>
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
                                Edit Profile
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
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    <Save size={16} />
                                    {isSaving ? 'Saving...' : 'Save'}
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
                        <h2 className="profile-section-title">Personal Information</h2>
                        <p className="profile-section-subtitle">
                            Update your contact details and birthday
                        </p>
                    </div>
                </header>

                <div className="profile-fields">
                    <div className="profile-row">
                        <div className="profile-row-label">
                            <UserCircle2 size={16} />
                            Username
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
                            Phone
                        </div>
                        <div className="profile-row-value profile-row-control">
                            {isEditing ? (
                                <input
                                    className="input input-no-icon"
                                    type="tel"
                                    placeholder="+1 000 000 0000"
                                    value={draft.phoneNumber || ''}
                                    onChange={(e) =>
                                        setDraft({ ...draft, phoneNumber: e.target.value })
                                    }
                                />
                            ) : userData.phoneNumber ? (
                                <span>{userData.phoneNumber}</span>
                            ) : (
                                <span className="is-empty">Not specified</span>
                            )}
                        </div>
                    </div>

                    <div className="profile-row">
                        <div className="profile-row-label">
                            <Calendar size={16} />
                            Birthday
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
                                <span className="is-empty">Not specified</span>
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
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <Save size={16} />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
