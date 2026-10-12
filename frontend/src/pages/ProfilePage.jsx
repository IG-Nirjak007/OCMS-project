import React from 'react';
import useAuth from '../../hooks/useAuth';

const ProfilePage = () => {
    const { user } = useAuth();
    
    if (!user) return null;

    const roleName = user.roles[0]?.name?.replace('ROLE_', '') || 'User';

    return (
        <div className="profile-page">
            <div className="profile-card">
                <div className="profile-header">
                    <h2>Profile</h2>
                    <span className="role-badge">{roleName}</span>
                </div>
                <div className="profile-details">
                    <div className="detail-row">
                        <span className="label">Name</span>
                        <span className="value">{user.username}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Email</span>
                        <span className="value">{user.email}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Status</span>
                        <span className="status-badge">✓ Verified</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;