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

    if (loading) return <div className="loading-container">Loading...</div>;

    return (
        <div className="notifications-container">
            <div className="notifications-header">
                <h1 className="notifications-title">Notifications</h1>
                {requests.length > 0 && (
                    <span className="notifications-badge">{requests.length}</span>
                )}
            </div>

            <div className="notifications-list">
                {requests.length === 0 ? (
                    <div className="notifications-empty">
                        <div className="notifications-empty-icon">
                            <BellOff size={40} />
                        </div>
                        <p>No new notifications</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.requestId} className="notification-item">
                            <div className="notification-user">
                                <div className="notification-avatar-wrap">
                                    <img
                                        src={req.senderAvatar || 'https://via.placeholder.com/56'}
                                        className="notification-avatar"
                                        alt={req.senderName}
                                    />
                                    <div className="notification-avatar-badge">
                                        <UserPlus size={12} />
                                    </div>
                                </div>
                                <div className="notification-info">
                                    <h4>@{req.senderName}</h4>
                                    <p>Wants to add you as a friend</p>
                                </div>
                            </div>

                            <div className="notification-actions">
                                <button
                                    onClick={() => handleRespond(req.requestId, 'accept')}
                                    className="notification-btn notification-btn-accept"
                                    title="Accept"
                                >
                                    <Check size={20} />
                                </button>
                                <button
                                    onClick={() => handleRespond(req.requestId, 'reject')}
                                    className="notification-btn notification-btn-reject"
                                    title="Reject"
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
