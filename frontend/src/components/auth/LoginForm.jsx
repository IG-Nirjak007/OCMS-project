import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const data = await login(email, password);
            const roles = data?.user?.roles || [];

            // Role-based redirect logic
            if (roles.includes('ROLE_ADMIN') || roles.includes('ADMIN')) {
                navigate('/admin');
            } else if (roles.includes('ROLE_TEACHER') || roles.includes('TEACHER')) {
                navigate('/teacher');
            } else {
                navigate('/my-courses');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        }
    };

    return (
        <div className="login-form-container">
            <h2>Login to OCMS</h2>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="enter your email"
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="enter your password"
                    />
                </div>
                <button type="submit" className="btn-primary">Sign In</button>
            </form>
        </div>
    );
};

export default LoginForm;