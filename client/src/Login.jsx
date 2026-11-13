import { useState } from 'react';
import Toast from './Toast';

function Login({ onLogin }) {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [toast, setToast] = useState({
        message: '',
        type: ''
    });
    const showToast = (message, type = 'success') => {
        setToast({ message, type });

        setTimeout(() => {
            setToast({ message: '', type: '' });
        }, 3000);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        const endpoint = isRegister ? 'register' : 'login';

        try {
            const response = await fetch(
                `http://localhost:5000/api/auth/${endpoint}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(
                        isRegister
                            ? { name, email, password }
                            : { email, password }
                    ),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                showToast(data.message, 'error');
                return;
            }

            if (isRegister) {
                showToast('Registration successful! Please login.', 'success');
                setIsRegister(false);
            } else {
                localStorage.setItem('token', data.token);
                onLogin(data.user);
            }
        } catch (error) {
            showToast('Unable to connect to server. Please try again.', 'error');
        }
    };

    return (
        <div className="login-page">
            <div className="login-intro">
                <div className="intro-label">
                    ✦ YOUR PERSONAL HEALTH COMPANION
                </div>
                <h1>Sweety ♡</h1>
                <h2>Your Health, Your Happiness.</h2>
                <p>
                    Track your glucose. Understand your health.
                    Take control of your day.
                </p>
                <span>Healthy habits start here.</span>
            </div>
            <section className="reading-form login-card">
                <h2>{isRegister ? 'Create Account' : 'Welcome to Sweety'}</h2>

                <form onSubmit={handleSubmit}>
                    {isRegister && (
                        <>
                            <label>Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </>
                    )}

                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                <svg viewBox="0 0 24 24" width="21" height="21"
                                    fill="none" stroke="currentColor" strokeWidth="2"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 3l18 18" />
                                    <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                                    <path d="M9.9 5.2A10.8 10.8 0 0121 12s-1.5 3-4.2 4.6" />
                                    <path d="M6.2 6.2A12 12 0 003 12s3 7 9 7a9 9 0 003-.5" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" width="21" height="21"
                                    fill="none" stroke="currentColor" strokeWidth="2"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <button type="submit">
                        {isRegister ? 'Register' : 'Login'}
                    </button>
                </form>

                <p onClick={() => setIsRegister(!isRegister)}>
                    {isRegister
                        ? 'Already have an account? Login'
                        : "Don't have an account? Register"}
                </p>
            </section>

            <Toast message={toast.message} type={toast.type} />
        </div>
    );
}

export default Login;