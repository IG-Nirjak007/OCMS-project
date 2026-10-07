import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';

const RegisterPage = () => {
    const navigate = useNavigate();
    return (
        <div className="auth-page">
            <h2>Create an Account</h2>
            <RegisterForm onSuccess={() => navigate('/login')} />
        </div>
    );
};

export default RegisterPage;// RegisterPage — POST /api/auth/register
// TODO: implement registration form (username, email, password, role)
