import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">OCMS</Link>
                <div className="navbar-links">
                    <Link to="/">Explore</Link>
                    {user && <Link to="/classroom">Classroom</Link>}
                    {user ? (
                        <>
                            <button className="nav-btn" onClick={handleLogout}>Logout</button>
                            <Link to="/profile">Profile</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Signup</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;