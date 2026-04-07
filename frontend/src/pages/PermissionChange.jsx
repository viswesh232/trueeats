import { useEffect, useState } from 'react';
import API from '../api/axios';
import { Trash2 } from 'lucide-react';

const PermissionChange = () => {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        const { data } = await API.get('/admin/users');
        setUsers(data);
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleRoleChange = async (userId, newRole) => {
        await API.put(`/admin/user/${userId}`, { role: newRole });
        fetchUsers();
    };

    const handleDelete = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            try {
                await API.delete(`/admin/user/${userId}`); // We will add this backend route next!
                fetchUsers();
            } catch (err) { alert("Error deleting user"); }
        }
    };

    return (
        <div style={{ padding: '40px' }}>
            <h2>Permission Change</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead style={{ borderBottom: '2px solid #eee' }}>
                    <tr style={{ textAlign: 'left' }}>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role Permission</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                            <td style={{ padding: '15px' }}>{user.firstName}</td>
                            <td>{user.email}</td>
                            <td>
                                <select 
                                    value={user.role} 
                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                    style={{ padding: '5px', borderRadius: '5px' }}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                            <td>
                                <button onClick={() => handleDelete(user._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
                                    <Trash2 size={20} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PermissionChange;