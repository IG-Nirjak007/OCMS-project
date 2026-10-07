import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, deleteUser } from '../../api/adminApi';

const ManageUsersPage = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        getAllUsers().then((res) => setUsers(res.data));
    }, []);

    const handleRoleChange = async (id, role) => {
        await updateUserRole(id, role);
        setUsers(users.map((u) => (u.id === id ? { ...u, role } : u)));
    };

    const handleDelete = async (id) => {
        await deleteUser(id);
        setUsers(users.filter((u) => u.id !== id));
    };

    return (
        <div className="page-container">
            <h2>Manage System Users</h2>
            <table>
                <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
                </thead>
                <tbody>
                {users.map((u) => (
                    <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                            <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                                <option value="ROLE_STUDENT">Student</option>
                                <option value="ROLE_TEACHER">Teacher</option>
                                <option value="ROLE_ADMIN">Admin</option>
                            </select>
                        </td>
                        <td><button onClick={() => handleDelete(u.id)}>Delete</button></td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageUsersPage;// ManageUsersPage - GET /api/admin/users stub
