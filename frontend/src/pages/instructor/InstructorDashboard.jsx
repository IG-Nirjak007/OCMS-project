import React from 'react';
import useAuth from '../../hooks/useAuth';

const InstructorDashboard = () => {
    const { user, logout } = useAuth();
    
    return (
        <div className="page-wrapper flex-col container">
            <div className="flex justify-between items-center mb-8">
                <h2>Instructor Dashboard</h2>
                <button className="btn btn-secondary" onClick={logout}>Logout</button>
            </div>
            <div className="card">
                <h3>Welcome, {user?.username}</h3>
                <p>You can manage your courses and assignments here.</p>
            </div>
        </div>
    );
};
export default InstructorDashboard;