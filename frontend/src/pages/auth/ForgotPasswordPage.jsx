import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Step 1: Request OTP email
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await client.post('/auth/request-otp', { email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP code.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify Redis-backed OTP code
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await client.post('/auth/verify-otp', { email, otp });
            setResetToken(res.data.resetToken);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP.');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Set new password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await client.post('/auth/reset-password', { email, resetToken, newPassword });
            navigate('/login', { state: { message: 'Password reset successful. Please log in.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>Password Recovery</h2>
            {error && <div className="error-alert">{error}</div>}

            {step === 1 && (
                <form onSubmit={handleRequestOtp}>
                    <p>Enter your account email to receive a 6-digit OTP code.</p>
                    <input
                        type="email"
                        placeholder="User Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Sending...' : 'Send OTP Code'}
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerifyOtp}>
                    <p>Enter the 6-digit code sent to {email}:</p>
                    <input
                        type="text"
                        placeholder="OTP Code"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleResetPassword}>
                    <p>Enter your new password:</p>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default ForgotPasswordPage;