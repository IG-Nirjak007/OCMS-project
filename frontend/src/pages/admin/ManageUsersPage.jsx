import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, deleteUser } from '../../api/adminApi';

const ManageUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await getAllUsers();
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await updateUserRole(id, newRole);
            setUsers(users.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
        } catch (err) {
            alert('Failed to update user role.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await deleteUser(id);
            setUsers(users.filter((u) => u.id !== id));
        } catch (err) {
            alert('Failed to delete user.');
        }
    };

    if (loading) return <div>Loading user directory...</div>;

    return (
        <div className="page-container">
            <h2>Platform User Management</h2>
            <table className="data-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map((u) => (
                    <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                            <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                                <option value="ROLE_STUDENT">Student</option>
                                <option value="ROLE_TEACHER">Teacher</option>
                                <option value="ROLE_ADMIN">Admin</option>
                            </select>
                        </td>
                        <td>
                            <button className="btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageUsersPage;