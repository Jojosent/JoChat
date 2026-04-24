import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageCircle, UserRoundPlus, CheckCircle } from 'lucide-react';

export default function PublicProfilePage() {
    const { username } = useParams();
    const currentUser = localStorage.getItem('currentUser');
    const [profile, setProfile] = useState(null);
    const [requestSent, setRequestSent] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:8080/api/user/profile/${username}?currentUser=${currentUser}`)
            .then(res => res.json())
            .then(data => setProfile(data))
            .catch(err => console.error(err));
    }, [username, currentUser]);

    const handleSendRequest = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/user/friends/request/${username}?currentUser=${currentUser}`, {
                method: 'POST'
            });
            if (response.ok) {
                setRequestSent(true);
            }
        } catch (error) {
            console.error("Error sending request", error);
        }
    };

    if (!profile) return <div className="loading-container">Loading...</div>;

    return (
        <div className="public-profile">
            <div className="public-profile-card">
                <img
                    src={profile.avatarUrl || 'https://via.placeholder.com/140'}
                    alt={profile.username}
                    className="public-profile-avatar"
                />
                
                <h2 className="public-profile-name">@{profile.username}</h2>

                <div className="public-profile-actions">
                    <div className="public-profile-btn-row">
                        <button
                            onClick={() => alert("Messaging feature coming soon!")}
                            className="btn-glass"
                        >
                            <MessageCircle size={20} />
                            Message
                        </button>
                    </div>

                    <button
                        onClick={handleSendRequest}
                        disabled={requestSent}
                        className={requestSent ? 'btn btn-secondary btn-block' : 'btn btn-primary btn-block'}
                        style={{ marginTop: '4px' }}
                    >
                        {requestSent ? (
                            <>
                                <CheckCircle size={20} />
                                Request Sent
                            </>
                        ) : (
                            <>
                                <UserRoundPlus size={20} />
                                Add Friend
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
