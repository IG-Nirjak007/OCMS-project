import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
    const { user } = useAuth();

    return (
        <aside className="sidebar">
            <Link to="/">Dashboard</Link>
            {user?.roles?.includes('ROLE_STUDENT') && <Link to="/my-courses">My Courses</Link>}
            {user?.roles?.includes('ROLE_TEACHER') && <Link to="/teacher/materials">Manage Materials</Link>}
            {user?.roles?.includes('ROLE_ADMIN') && <Link to="/admin/users">Manage Users</Link>}
        </aside>
    );
};

export default Sidebar;// Sidebar layout component stub
