import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import StaggeredMenu from '../components/StaggeredMenu';
import { useTheme } from '../App';
import '../App.css';

export default function MainLayout() {
    const navigate = useNavigate();
    const { darkMode, toggleTheme } = useTheme();
    const [pendingRequests, setPendingRequests] = useState([]);
    const currentUser = localStorage.getItem('currentUser');

    // Load friend requests
    useEffect(() => {
        if (!currentUser) return;

        const fetchRequests = () => {
            fetch(`http://localhost:8080/api/user/friends/pending?currentUser=${currentUser}`)
                .then(res => res.json())
                .then(data => setPendingRequests(data))
                .catch(err => console.error("Error loading requests:", err));
        };

        fetchRequests();
        const interval = setInterval(fetchRequests, 30000);
        return () => clearInterval(interval);
    }, [currentUser]);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/');
    };

    const menuItems = [
        { label: 'Profile', ariaLabel: 'Go to profile', link: '/main/profile' },
        { label: 'Messages', ariaLabel: 'Go to chat', link: '/main/chat' },
        { label: 'Search', ariaLabel: 'Search users', link: '/main/search' },
        { 
            label: `Notifications${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ''}`, 
            ariaLabel: 'View notifications', 
            link: '/main/notifications' 
        },
        { label: 'Logout', ariaLabel: 'Log out', link: '/logout' },
    ];

    const socialItems = [
        { label: 'GitHub', link: 'https://github.com' },
        { label: 'Twitter', link: 'https://twitter.com' },
    ];

    const handleNavigate = (link) => {
        if (link === '/logout') {
            handleLogout();
        } else {
            navigate(link);
        }
    };

    return (
        <>
            <div className="animated-gradient-bg" />
            <div className="noise-overlay" />
            <div className="layout">
                <StaggeredMenu
                    position="right"
                    items={menuItems}
                    socialItems={socialItems}
                    displaySocials={true}
                    displayItemNumbering={true}
                    menuButtonColor={darkMode ? '#fafafa' : '#18181b'}
                    openMenuButtonColor="#fafafa"
                    changeMenuColorOnOpen={true}
                    colors={darkMode ? ['#18181b', '#27272a'] : ['#f4f4f5', '#e4e4e7']}
                    accentColor="#a78bfa"
                    onNavigate={handleNavigate}
                    darkMode={darkMode}
                    onToggleTheme={toggleTheme}
                    isFixed={true}
                />

                <main className="content">
                    <Outlet />
                </main>
            </div>
        </>
    );
}
