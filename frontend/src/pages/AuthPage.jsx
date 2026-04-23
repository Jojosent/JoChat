import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload = isLogin ? { username, password } : { username, email, password };

        try {
            const response = await fetch(`http://localhost:8080${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                if (isLogin) {
                    // Сохраняем логин и переходим на главную
                    localStorage.setItem('currentUser', data.username);
                    navigate('/main/profile');
                } else {
                    setMessage('Успешно! Теперь войдите.');
                    setIsLogin(true);
                }
            } else {
                setMessage(data.message);
            }
        } catch {
            setMessage('Ошибка соединения с сервером');
        }
    };

    return (
        <div className="container center-screen">
            <div className="card">
                <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text" placeholder="Логин"
                        value={username} onChange={(e) => setUsername(e.target.value)} required
                    />
                    {!isLogin && (
                        <input
                            type="email" placeholder="Email"
                            value={email} onChange={(e) => setEmail(e.target.value)} required
                        />
                    )}
                    <input
                        type="password" placeholder="Пароль"
                        value={password} onChange={(e) => setPassword(e.target.value)} required
                    />
                    <button type="submit">{isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
                </form>
                {message && <p className="message">{message}</p>}
                <p className="toggle-text" onClick={() => { setIsLogin(!isLogin); setMessage(''); }}>
                    {isLogin ? 'Нет аккаунта? Создать' : 'Уже есть аккаунт? Войти'}
                </p>
            </div>
        </div>
    );
}