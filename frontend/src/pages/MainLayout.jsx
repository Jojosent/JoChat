import { Outlet, useNavigate } from 'react-router-dom';

export default function MainLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/');
    };

    return (
        <div className="layout">
            <nav className="navbar">
                <div className="nav-logo">JoChat</div>
                <div className="nav-links">
                    <span onClick={() => navigate('/main/profile')}>Профиль</span>
                    <span onClick={handleLogout} className="logout-btn">Выйти</span>
                </div>
            </nav>
            {/* Здесь будут рендериться внутренние страницы (ProfilePage и др.) */}
            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}