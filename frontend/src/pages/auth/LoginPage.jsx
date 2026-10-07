import React from 'react';
import LoginForm from '../../components/auth/LoginForm';

const LoginPage = () => (
    <div className="auth-page">
        <h2>Platform Login</h2>
        <LoginForm />
    </div>
);

export default LoginPage;// LoginPage — POST /api/auth/login
// TODO: implement login form with username + password fields
