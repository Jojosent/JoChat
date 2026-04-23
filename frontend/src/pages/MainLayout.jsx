import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, User, LogOut } from 'lucide-react';

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/');
    };

    const isProfile = location.pathname.startsWith('/main/profile');

    return (
        <div className="layout">
            <nav className="navbar" aria-label="Главная навигация">
                <div className="navbar-inner">
                    <div
                        className="nav-brand"
                        onClick={() => navigate('/main/profile')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') navigate('/main/profile');
                        }}
                    >
                        <div className="nav-brand-mark" aria-hidden="true">
                            <MessageCircle size={18} strokeWidth={2.25} />
                        </div>
                        <span className="nav-brand-name">JoChat</span>
                    </div>

                    <div className="nav-links">
                        <button
                            type="button"
                            className={`nav-link ${isProfile ? 'is-active' : ''}`}
                            onClick={() => navigate('/main/profile')}
                        >
                            <User size={16} strokeWidth={2} />
                            <span>Профиль</span>
                        </button>
                        <div className="nav-divider" aria-hidden="true" />
                        <button
                            type="button"
                            className="nav-link nav-logout"
                            onClick={handleLogout}
                        >
                            <LogOut size={16} strokeWidth={2} />
                            <span>Выйти</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}
