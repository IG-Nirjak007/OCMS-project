import React, { useState } from 'react';
import { registerApi } from '../../api/authApi';

const RegisterForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'ROLE_STUDENT' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerApi(formData);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            {error && <p className="error">{error}</p>}
            <input type="text" placeholder="Full Name" required onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <input type="email" placeholder="Email" required onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <input type="password" placeholder="Password" required onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            <select onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <option value="ROLE_STUDENT">Student</option>
                <option value="ROLE_TEACHER">Teacher</option>
            </select>
            <button type="submit">Register</button>
        </form>
    );
};

export default RegisterForm;// RegisterForm component stub
