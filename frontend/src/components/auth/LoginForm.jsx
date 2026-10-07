import React, { useState } from 'react';
import { loginApi } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';

const LoginForm = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await loginApi(credentials);
        login(res.data.token, res.data.user);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Username"
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            />
            <input
                type="password"
                placeholder="Password"
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />
            <button type="submit">Login</button>
        </form>
    );
};

export default LoginForm;// LoginForm component stub
