import React, { useState } from 'react';
import { forgotPasswordApi } from '../../api/authApi';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await forgotPasswordApi(email);
            setMessage('Password reset instructions sent to your email.');
        } catch {
            setMessage('Failed to send reset link.');
        }
    };

    return (
        <div className="auth-page">
            <h2>Forgot Password</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <button type="submit">Send Reset Link</button>
            </form>
        </div>
    );
};

export default ForgotPasswordPage;// ForgotPasswordPage stub
