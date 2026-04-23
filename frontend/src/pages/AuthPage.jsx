import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    MessageCircle,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
} from 'lucide-react';
import '../App.css';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('error'); // 'error' | 'success'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const switchMode = (loginMode) => {
        setIsLogin(loginMode);
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload = isLogin ? { username, password } : { username, email, password };

        try {
            const response = await fetch(`http://localhost:8080${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                if (isLogin) {
                    localStorage.setItem('currentUser', data.username);
                    navigate('/main/profile');
                } else {
                    setMessageType('success');
                    setMessage('Успешно! Теперь войдите.');
                    setIsLogin(true);
                }
            } else {
                setMessageType('error');
                setMessage(data.message || 'Произошла ошибка');
            }
        } catch {
            setMessageType('error');
            setMessage('Ошибка соединения с сервером');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="auth-card">
                <div className="auth-brand">
                    <div className="auth-brand-mark" aria-hidden="true">
                        <MessageCircle size={22} strokeWidth={2.25} />
                    </div>
                    <span className="auth-brand-name">JoChat</span>
                </div>

                <h1 className="auth-title">
                    {isLogin ? 'С возвращением' : 'Создать аккаунт'}
                </h1>
                <p className="auth-subtitle">
                    {isLogin
                        ? 'Войдите, чтобы продолжить общение'
                        : 'Присоединяйтесь к JoChat за пару секунд'}
                </p>

                <div className="auth-tabs" role="tablist" aria-label="Auth mode">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={isLogin}
                        className={`auth-tab ${isLogin ? 'is-active' : ''}`}
                        onClick={() => switchMode(true)}
                    >
                        Вход
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={!isLogin}
                        className={`auth-tab ${!isLogin ? 'is-active' : ''}`}
                        onClick={() => switchMode(false)}
                    >
                        Регистрация
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <div className="field">
                        <label className="field-label" htmlFor="username">
                            Логин
                        </label>
                        <div className="input-wrap">
                            <span className="input-icon">
                                <User size={18} strokeWidth={2} />
                            </span>
                            <input
                                id="username"
                                className="input"
                                type="text"
                                placeholder="Ваш логин"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="field">
                            <label className="field-label" htmlFor="email">
                                Email
                            </label>
                            <div className="input-wrap">
                                <span className="input-icon">
                                    <Mail size={18} strokeWidth={2} />
                                </span>
                                <input
                                    id="email"
                                    className="input"
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="field">
                        <label className="field-label" htmlFor="password">
                            Пароль
                        </label>
                        <div className="input-wrap">
                            <span className="input-icon">
                                <Lock size={18} strokeWidth={2} />
                            </span>
                            <input
                                id="password"
                                className="input"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Введите пароль"
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="input-toggle"
                                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                                onClick={() => setShowPassword((v) => !v)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div
                            className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}
                            role="alert"
                        >
                            {messageType === 'success' ? (
                                <CheckCircle2 size={18} />
                            ) : (
                                <AlertCircle size={18} />
                            )}
                            <span>{message}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? 'Пожалуйста, подождите…'
                            : isLogin
                                ? 'Войти'
                                : 'Зарегистрироваться'}
                        {!isSubmitting && <ArrowRight size={18} />}
                    </button>
                </form>

                <div className="auth-footer">
                    {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                    <button
                        type="button"
                        className="link-btn"
                        onClick={() => switchMode(!isLogin)}
                    >
                        {isLogin ? 'Создать' : 'Войти'}
                    </button>
                </div>
            </div>
        </div>
    );
}
