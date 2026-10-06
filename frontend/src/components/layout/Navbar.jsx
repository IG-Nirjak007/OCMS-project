import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <h2>OCMS Platform</h2>
            {user && (
                <div>
                    <span>Welcome, {user.name}</span>
                    <button onClick={logout}>Logout</button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;// Navbar layout component stub
