import React, { useEffect, useState } from 'react';
import { getAdminStats } from '../../api/adminApi';

const AdminDashboardPage = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getAdminStats().then((res) => setStats(res.data));
    }, []);

    return (
        <div className="page-container">
            <h1>Admin Command Center</h1>
            {stats ? (
                <div className="stats-grid">
                    <div className="stat-card">Total Users: {stats.totalUsers}</div>
                    <div className="stat-card">Total Courses: {stats.totalCourses}</div>
                </div>
            ) : (
                <p>Loading analytics...</p>
            )}
        </div>
    );
};

export default AdminDashboardPage;// AdminDashboardPage stub
