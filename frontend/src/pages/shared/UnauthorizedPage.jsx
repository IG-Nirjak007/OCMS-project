import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => (
    <div className="page-container text-center">
        <h1>403 - Access Denied</h1>
        <p>You do not have permission to view this page.</p>
        <Link to="/">Return to Safety</Link>
    </div>
);

export default UnauthorizedPage;// UnauthorizedPage stub
