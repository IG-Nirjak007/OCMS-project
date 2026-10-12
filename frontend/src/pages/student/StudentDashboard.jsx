import React from 'react';
import useAuth from '../../hooks/useAuth';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    
    return (
        <div className="page-wrapper flex-col container">
            <div className="flex justify-between items-center mb-8">
                <h2>Student Dashboard</h2>
                <button className="btn btn-secondary" onClick={logout}>Logout</button>
            </div>
            <div className="card">
                <h3>Welcome, {user?.username}</h3>
                <p>You can view your enrolled courses here.</p>
            </div>
        </div>
    );
};
export default StudentDashboard;